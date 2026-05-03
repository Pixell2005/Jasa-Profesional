package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware - mengizinkan frontend React terhubung ke backend
// Tanpa ini, browser akan memblokir semua request dari localhost:5173 ke localhost:8080
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// Authorization wajib ada di sini agar browser izinkan frontend kirim token JWT
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Browser selalu kirim request OPTIONS dulu sebelum POST/PUT yang ada headernya
		// Ini disebut "preflight request" - di jawab langsung dengan 204
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()

	}
}