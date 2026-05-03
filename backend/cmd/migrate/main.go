package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
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

	// Drop all tables (for fresh setup)
	fmt.Println("🔄 Clearing existing schema...")
	dropTables := `
		DROP TABLE IF EXISTS admin_logs CASCADE;
		DROP TABLE IF EXISTS bookings CASCADE;
		DROP TABLE IF EXISTS vendors CASCADE;
		DROP TABLE IF EXISTS users CASCADE;
	`
	for _, stmt := range strings.Split(dropTables, ";") {
		stmt = strings.TrimSpace(stmt)
		if stmt != "" {
			db.Exec(stmt)
		}
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
	// Read all SQL files in migrations directory
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".sql") {
			continue
		}

		filePath := filepath.Join(migrationsDir, file.Name())
		fmt.Printf("🔄 Running migration: %s\n", file.Name())

		content, err := ioutil.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", file.Name(), err)
		}

		// Split multiple statements and execute each
		statements := strings.Split(string(content), ";")
		for _, stmt := range statements {
			stmt = strings.TrimSpace(stmt)
			if stmt == "" {
				continue
			}

			if _, err := db.Exec(stmt); err != nil {
				// Ignore "already exists" errors
				if !strings.Contains(err.Error(), "already exists") {
					return fmt.Errorf("failed to execute: %w\nStatement: %s", err, stmt)
				}
			}
		}

		fmt.Printf("✅ Completed: %s\n", file.Name())
	}

	return nil
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
