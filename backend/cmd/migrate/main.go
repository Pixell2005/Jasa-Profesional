package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	"strings"

	"github.com/daniel/jasa-profesional/config"
	_ "github.com/lib/pq"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to database
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		log.Fatalf("❌ Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Database unreachable: %v", err)
	}

	fmt.Println("✅ Database connected")

	// Get current working directory
	cwd, err := filepath.Abs(".")
	if err != nil {
		log.Fatalf("❌ Failed to get current directory: %v", err)
	}

	// Drop all tables (for fresh setup) — CASCADE handles foreign key dependencies
	fmt.Println("🔄 Clearing existing schema...")
	dropTables := []string{
		"DROP TABLE IF EXISTS reviews CASCADE",
		"DROP TABLE IF EXISTS payments CASCADE",
		"DROP TABLE IF EXISTS audit_logs CASCADE",
		"DROP TABLE IF EXISTS admin_logs CASCADE",
		"DROP TABLE IF EXISTS bookings CASCADE",
		"DROP TABLE IF EXISTS vendors CASCADE",
		"DROP TABLE IF EXISTS users CASCADE",
		"DROP FUNCTION IF EXISTS set_updated_at CASCADE",
		"DROP FUNCTION IF EXISTS set_vendors_updated_at CASCADE",
		"DROP FUNCTION IF EXISTS set_payments_updated_at CASCADE",
	}
	for _, stmt := range dropTables {
		db.Exec(stmt)
	}
	fmt.Println("✅ Schema cleared")

	// Run migrations
	migrationsDir := filepath.Join(cwd, "db", "migrations")
	if err := runMigrations(db, migrationsDir); err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	// Run seed
	seedFile := filepath.Join(cwd, "db", "seed.sql")
	if err := runSeed(db, seedFile); err != nil {
		log.Fatalf("❌ Seed failed: %v", err)
	}

	fmt.Println("✅ All done! Database is ready.")
}

func runMigrations(db *sql.DB, migrationsDir string) error {
	// Baca semua file SQL di folder migrations
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Filter: HANYA .up.sql dan 001_init.sql (skip .down.sql!)
	var migrationFiles []string
	for _, file := range files {
		name := file.Name()
		if name == "001_init.sql" || strings.HasSuffix(name, ".up.sql") {
			migrationFiles = append(migrationFiles, name)
		}
	}

	// Custom sort: 001_init.sql PERTAMA, lalu sisanya urut abjad
	sort.Slice(migrationFiles, func(i, j int) bool {
		if migrationFiles[i] == "001_init.sql" {
			return true
		}
		if migrationFiles[j] == "001_init.sql" {
			return false
		}
		return migrationFiles[i] < migrationFiles[j]
	})

	for _, fileName := range migrationFiles {
		filePath := filepath.Join(migrationsDir, fileName)
		fmt.Printf("🔄 Running migration: %s\n", fileName)

		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", fileName, err)
		}

		// Gunakan smart splitter yang mengerti dollar-quoted PL/pgSQL ($$...$$)
		statements := splitSQLStatements(string(content))
		for _, stmt := range statements {
			stmt = strings.TrimSpace(stmt)
			if stmt == "" {
				continue
			}
			// Skip jika statement HANYA berisi komentar (tidak ada SQL aktif)
			if isPureComment(stmt) {
				continue
			}

			if _, err := db.Exec(stmt); err != nil {
				errMsg := err.Error()
				stmtUpper := strings.ToUpper(stmt)
				// Abaikan error yang tidak kritikal:
				// - "already exists": objek sudah ada
				// - "does not exist" pada INDEX: index pada tabel belum ada (akan dibuat nanti)
				// - Error pada TRIGGER yang referensi fungsi yang sudah ada
				ignored := strings.Contains(errMsg, "already exists") ||
					(strings.Contains(errMsg, "does not exist") && strings.Contains(stmtUpper, "INDEX"))
				if !ignored {
					return fmt.Errorf("failed to execute: %w\nStatement: %s", err, stmt)
				}
				fmt.Printf("   ⚠️  Ignored: %v\n", errMsg)
			}
		}

		fmt.Printf("✅ Completed: %s\n", fileName)
	}

	return nil
}

// splitSQLStatements memisahkan SQL file menjadi individual statements.
// Sadar akan dollar-quoted strings ($$...$$) sehingga tidak memotong
// PL/pgSQL function body di tengah jalan.
func splitSQLStatements(sql string) []string {
	var statements []string
	var current strings.Builder
	inDollarQuote := false
	dollarTag := ""

	i := 0
	for i < len(sql) {
		// Deteksi awal dollar-quote: $$ atau $tag$
		if !inDollarQuote && sql[i] == '$' {
			// Cari closing $
			j := i + 1
			for j < len(sql) && sql[j] != '$' && sql[j] != '\n' {
				j++
			}
			if j < len(sql) && sql[j] == '$' {
				// Ini adalah dollar-quote tag
				tag := sql[i : j+1] // e.g. "$$" or "$body$"
				inDollarQuote = true
				dollarTag = tag
				current.WriteString(tag)
				i = j + 1
				continue
			}
		}

		// Deteksi akhir dollar-quote
		if inDollarQuote && strings.HasPrefix(sql[i:], dollarTag) {
			current.WriteString(dollarTag)
			i += len(dollarTag)
			inDollarQuote = false
			dollarTag = ""
			continue
		}

		// Split pada semicolon hanya jika tidak di dalam dollar-quote
		if !inDollarQuote && sql[i] == ';' {
			stmt := strings.TrimSpace(current.String())
			if stmt != "" {
				statements = append(statements, stmt)
			}
			current.Reset()
			i++
			continue
		}

		current.WriteByte(sql[i])
		i++
	}

	// Tambahkan sisa statement terakhir (jika ada)
	if stmt := strings.TrimSpace(current.String()); stmt != "" {
		statements = append(statements, stmt)
	}

	return statements
}

// isPureComment: cek apakah statement hanya berisi SQL comment (--), bukan SQL aktif.
// Statement "-- komentar\nCREATE TABLE..." TIDAK pure comment.
// Statement "-- hanya komentar" atau "" adalah pure comment.
func isPureComment(stmt string) bool {
	for _, line := range strings.Split(stmt, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if !strings.HasPrefix(line, "--") {
			return false // Ada baris yang bukan komentar — ini SQL aktif
		}
	}
	return true // Semua baris adalah komentar atau kosong
}

func runSeed(db *sql.DB, seedFile string) error {
	fmt.Println("🔄 Running seed data...")

	content, err := ioutil.ReadFile(seedFile)
	if err != nil {
		return fmt.Errorf("failed to read seed file: %w", err)
	}

	// Split by statements
	statements := strings.Split(string(content), ";")
	successCount := 0

	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}

		if _, err := db.Exec(stmt); err != nil {
			// Only log error if it's not a duplicate key error (for testing)
			if !strings.Contains(err.Error(), "duplicate key") {
				fmt.Printf("⚠️  Warning: %v\n", err)
			}
		} else {
			successCount++
		}
	}

	fmt.Printf("✅ Seed completed (%d statements)\n", successCount)
	return nil
}
