package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/daniel/jasa-profesional/config"
	_ "github.com/lib/pq"
)

func main() {
	cfg := config.Load()
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	db.Ping()

	// Cek tabel yang ada
	rows, _ := db.Query(`
		SELECT tablename FROM pg_tables 
		WHERE schemaname = 'public' 
		ORDER BY tablename
	`)
	defer rows.Close()
	fmt.Println("=== Tabel yang ada di DB ===")
	for rows.Next() {
		var t string
		rows.Scan(&t)
		fmt.Println(" -", t)
	}

	// Coba CREATE TABLE users langsung
	fmt.Println("\n=== Test CREATE TABLE users ===")
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users_test (id UUID PRIMARY KEY DEFAULT gen_random_uuid())`)
	if err != nil {
		fmt.Println("ERROR:", err)
	} else {
		fmt.Println("OK - DB bisa bikin tabel")
		db.Exec("DROP TABLE users_test")
	}
}
