package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type jwtClaims struct {
	UserId string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthRequired - middleware yang memblokir request tanpa JWT yang valid
// Cara kerja: dipasang di depan route, dijalankan sebelum handler
// Kalau token tidak valid -> request berhenti disini, handler tidak dieksekui
func AuthRequired(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ambil header Authorization
		// Format yang benar: "Bearer eyJhhGci..."
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token tidak ditemukan, silahkan login terlebih dahulu",
			})
			return
		}

		// 2. Cek formatnya benar (harus mulai dengan "Bearer ")
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "format token tidak valid",
			})
			return
		}

		tokenString := parts[1]

		// 3. Parse dan verifikasi token
		claims := &jwtClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Pastikan algoritma yang dipakai adalah HS256
			// Mencegah serangan "none alrgorithm" - token tanpa tanda tangan
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		// 4. Cek apakah token valid
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token tidak valid atau sudah kadaluarsa",
			})
			return
		}

		// 5. Token valid - simpan data user ke context
		// Bisa diambil di handler dengan: middleware.GetUserID(c)
		c.Set("userID", claims.UserId)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)

		// Lanjut ke handler berikutnya
		c.Next()
	}
}

// GetUserID - helper untuk ambil ID user dari context di dalam handler
func GetUserID(c *gin.Context) string {
	id, _ := c.Get("userID")
	return id.(string)
}

// GetUserRole - helper untuk ambil role user dari context
func GetUserRole(c *gin.Context) string {
	role, _ := c.Get("userRole")
	return role.(string)
}

// AdminRequired - middleware untuk memastikan user adalah admin
// Gunakan setelah AuthRequired middleware
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := GetUserRole(c)
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "hanya admin yang bisa akses resource ini",
			})
			return
		}
		c.Next()
	}
}

// VendorRequired - middleware untuk memastikan user adalah vendor
// Gunakan setelah AuthRequired middleware
func VendorRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := GetUserRole(c)
		if role != "vendor" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "hanya vendor yang bisa akses resource ini",
			})
			return
		}
		c.Next()
	}
}
