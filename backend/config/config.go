package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	// DBSSLMode: Mode SSL untuk koneksi PostgreSQL
	// Development: "disable", Production: "require" atau "verify-full"
	DBSSLMode  string

	// JWT
	JWTSecret      string
	JWTExpireHours int

	// App
	AppPort string
	AppEnv  string

	// CORS
	// AllowedOrigin: Origin yang diizinkan untuk CORS
	// Development: "http://localhost:5173"
	// Production: URL frontend yang di-deploy (e.g., "https://jasa-profesional.vercel.app")
	AllowedOrigin string
}

// Load membaca file .env lalu mengisi struct Config
func Load() *Config {
	// Baca file .env - kalau gagal tidak masalah (bisa pakai env variable langsung)
	godotenv.Load()

	expireHours, _ := strconv.Atoi(os.Getenv("JWT_EXPIRE_HOURS"))
	if expireHours == 0 {
		expireHours = 24 // default 24 jam
	}

	sslMode := os.Getenv("DB_SSLMODE")
	if sslMode == "" {
		sslMode = "disable" // default untuk development lokal
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173" // default untuk development
	}

	return &Config{
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         os.Getenv("DB_PORT"),
		DBUser:         os.Getenv("DB_USER"),
		DBPassword:     os.Getenv("DB_PASSWORD"),
		DBName:         os.Getenv("DB_NAME"),
		DBSSLMode:      sslMode,
		JWTSecret:      os.Getenv("JWT_SECRET"),
		JWTExpireHours: expireHours,
		AppPort:        os.Getenv("APP_PORT"),
		AppEnv:         os.Getenv("APP_ENV"),
		AllowedOrigin:  allowedOrigin,
	}
}

// DSN menghasilkan string koneksi untuk PostgreSQL
// sslmode dikontrol oleh env DB_SSLMODE (disable untuk dev, require untuk production)
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}