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

	rows, err := db.Query("SELECT email, role FROM users")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("=== USERS IN DATABASE ===")
	for rows.Next() {
		var email, role string
		rows.Scan(&email, &role)
		fmt.Printf("Email: %s | Role: %s\n", email, role)
	}
}
