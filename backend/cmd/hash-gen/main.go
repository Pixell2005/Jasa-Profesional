package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// UserSeed menyimpan info untuk generate hash
type UserSeed struct {
	Email    string
	Password string // password UNIK per user
	Note     string // keterangan role/nama
}

func main() {
	// Setiap user punya password unik
	// Format: <Prefix_Role>_<Nama>_<Tahun>!
	// Tujuan: jika 1 hash berhasil di-crack, tidak otomatis membocorkan akun lain
	users := []UserSeed{
		// Customers
		{Email: "customer1@test.com", Password: "Cust_Adi_2024!", Note: "customer - Adi Suryanto"},
		{Email: "customer2@test.com", Password: "Cust_Budi_2024!", Note: "customer - Budi Santoso"},
		{Email: "customer3@test.com", Password: "Cust_Citra_2024!", Note: "customer - Citra Dewi"},
		{Email: "customer4@test.com", Password: "Cust_Deni_2024!", Note: "customer - Deni Hermawan"},
		{Email: "customer5@test.com", Password: "Cust_Eka_2024!", Note: "customer - Eka Putri"},

		// Vendors
		{Email: "vendor1@test.com", Password: "Vend_Ahmad_2024!", Note: "vendor - Ahmad Ali"},
		{Email: "vendor2@test.com", Password: "Vend_Baskoro_2024!", Note: "vendor - Baskoro Jaya"},
		{Email: "vendor3@test.com", Password: "Vend_Citra_2024!", Note: "vendor - Citra Jasa"},
		{Email: "vendor4@test.com", Password: "Vend_Dian_2024!", Note: "vendor - Dian Sartika"},
		{Email: "vendor5@test.com", Password: "Vend_Eka_2024!", Note: "vendor - Eka Service"},

		// Admin — password paling kuat
		{Email: "admin@test.com", Password: "Adm!n_Sys_2024#", Note: "admin - Admin System"},
	}

	fmt.Println("-- ============================================")
	fmt.Println("-- GENERATED HASHES — copy-paste ke seed.sql")
	fmt.Println("-- ============================================")
	fmt.Println()

	for _, u := range users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Printf("ERROR hash %s: %v\n", u.Email, err)
			continue
		}
		fmt.Printf("-- [%s]\n", u.Note)
		fmt.Printf("-- email   : %s\n", u.Email)
		fmt.Printf("-- password: %s\n", u.Password)
		fmt.Printf("-- hash    : %s\n\n", string(hash))
	}
}