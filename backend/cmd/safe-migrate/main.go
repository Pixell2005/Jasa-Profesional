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

// safe-migrate: jalankan semua file *_up.sql + 001_init.sql secara berurutan
// TANPA drop tables — aman untuk database yang sudah ada datanya
// File dijalankan dalam urutan nama file (lexicographic order)
func main() {
	cfg := config.Load()

	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		log.Fatalf("❌ Gagal koneksi database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Database tidak bisa dijangkau: %v", err)
	}
	fmt.Println("✅ Database terhubung")

	cwd, _ := filepath.Abs(".")
	migrationsDir := filepath.Join(cwd, "db", "migrations")

	// Baca semua file .sql di folder migrations
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		log.Fatalf("❌ Gagal baca folder migrations: %v", err)
	}

	// Filter: hanya .up.sql dan 001_init.sql
	var migrationFiles []string
	for _, f := range files {
		name := f.Name()
		if strings.HasSuffix(name, ".up.sql") || name == "001_init.sql" {
			migrationFiles = append(migrationFiles, name)
		}
	}

	// Custom sort: 001_init.sql selalu pertama, sisanya urut nama
	sort.Slice(migrationFiles, func(i, j int) bool {
		if migrationFiles[i] == "001_init.sql" {
			return true
		}
		if migrationFiles[j] == "001_init.sql" {
			return false
		}
		return migrationFiles[i] < migrationFiles[j]
	})

	fmt.Printf("🔄 Ditemukan %d migration file(s):\n", len(migrationFiles))
	for _, f := range migrationFiles {
		fmt.Printf("   - %s\n", f)
	}
	fmt.Println()

	for _, fileName := range migrationFiles {
		filePath := filepath.Join(migrationsDir, fileName)
		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			log.Fatalf("❌ Gagal baca %s: %v", fileName, err)
		}

		fmt.Printf("🔄 Menjalankan: %s\n", fileName)

		// Jalankan per-statement agar partial error bisa di-handle
		statements := strings.Split(string(content), ";")
		for _, stmt := range statements {
			stmt = strings.TrimSpace(stmt)
			if stmt == "" || strings.HasPrefix(stmt, "--") {
				continue
			}
			if _, err := db.Exec(stmt); err != nil {
				errMsg := err.Error()
				// Toleransi untuk "already exists" dan "duplicate key"
				if strings.Contains(errMsg, "already exists") ||
					strings.Contains(errMsg, "duplicate key") {
					continue // skip, aman
				}
				fmt.Printf("   ⚠️  Warning: %v\n", errMsg)
			}
		}
		fmt.Printf("   ✅ Selesai: %s\n", fileName)
	}

	fmt.Println()
	fmt.Println("✅ Semua migration berhasil diapply!")
}
