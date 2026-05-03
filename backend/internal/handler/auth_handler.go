package handler

import (
	"net/http"

	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
	userRepo    *repository.UserRepository
}

func NewAuthHandler(authService *service.AuthService, userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{authService: authService, userRepo: userRepo}
}

// Register - POST /api/v1/auth/register
// Endpoint public, tidak butuh token
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest

	// ShouldBindJSON membaca body JSON dan validasi otomatis sesuai tag binding:"required"
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	user, err := h.authService.Register(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.Response{
		Success: true,
		Message: "registrasi berhasil",
		Data:    user,
	})
}

// Login - POST /api/v1/auth/login
// Endpoint public, tidak butuh token
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "email dan password wajib diisi",
		})
		return
	}

	// Ambil IP client untuk disimpan ke metadata login
	// c.ClientIP() sudah menangani X-Forwarded-For dan X-Real-IP
	clientIP := c.ClientIP()

	// Panggil LoginWithMetadata agar last_ip, login_count, last_login_at ter-update
	result, err := h.authService.LoginWithMetadata(req, clientIP)
	if err != nil {
		// Return 401 untuk semua error login - tidak membedakan "email salah" atau "password salah"

		c.JSON(http.StatusUnauthorized, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "login berhasil",
		Data:    result,
	})
}

// Me - GET /api/v1/auth/me
// Endpoint PROTECTED, harus lewat middleware AuthRequired
// Dipakai frontend untuk cek "siapa saya?" saat app pertama dibuka
func (h *AuthHandler) Me(c *gin.Context) {
	// Ambil userID dari context yang sudah di-set oleh middleware AuthRequired
	// Kalau sampai sini berarti token valid dan userID sudah ada
	userID := middleware.GetUserID(c)

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, model.Response{
			Success: false,
			Message: "user tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    user,
	})
}

// UpdateProfile - PUT /api/v1/auth/profile
// Update profil user yang sedang login
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		Name  string `json:"name" binding:"required"`
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	user, err := h.authService.UpdateProfile(userID, req.Name, req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "profil berhasil diupdate",
		Data:    user,
	})
}

// ChangePassword - PUT /api/v1/auth/change-password
// Ubah password user yang sedang login
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	err := h.authService.ChangePassword(userID, req.OldPassword, req.NewPassword)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "password berhasil diubah",
	})
}

// Logout - POST /api/v1/auth/logout
// Proses logout user
func (h *AuthHandler) Logout(c *gin.Context) {
	userID := middleware.GetUserID(c)

	err := h.authService.Logout(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal logout",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "logout berhasil",
	})
}
