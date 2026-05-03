package handler

import (
	"net/http"

	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	adminService *service.AdminService
}

func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// GetDashboard — GET /api/v1/admin/dashboard
// Endpoint PROTECTED — hanya admin yang bisa akses
func (h *AdminHandler) GetDashboard(c *gin.Context) {
	// Verify admin role di middleware (akan ditambahkan)
	userID := middleware.GetUserID(c)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, model.Response{
			Success: false,
			Message: "unauthorized",
		})
		return
	}

	dashboard, err := h.adminService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data dashboard",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    dashboard,
	})
}

// GetAllUsers — GET /api/v1/admin/users
// Endpoint PROTECTED — admin lihat semua users
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	users, err := h.adminService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data users",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    users,
	})
}

// GetAllVendors — GET /api/v1/admin/vendors
// Endpoint PROTECTED — admin lihat semua vendors
func (h *AdminHandler) GetAllVendors(c *gin.Context) {
	vendors, err := h.adminService.GetAllVendors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data vendors",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    vendors,
	})
}
