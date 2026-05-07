package handler

import (
	"net/http"

	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
)

type VendorHandler struct {
	vendorService *service.VendorService
}

func NewVendorHandler(vendorService *service.VendorService) *VendorHandler {
	return &VendorHandler{vendorService: vendorService}
}

// GetAll — GET /api/v1/vendors
// GET /api/v1/vendors?category=cleaning  ← dengan filter
// Endpoint publik — siapa pun bisa lihat daftar vendor
func (h *VendorHandler) GetAll(c *gin.Context) {
	// Query param optional: ?category=cleaning
	category := c.Query("category")

	vendors, err := h.vendorService.GetAll(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data vendor",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    vendors,
	})
}

// GetByID — GET /api/v1/vendors/:id
// Endpoint publik — lihat detail satu vendor
func (h *VendorHandler) GetByID(c *gin.Context) {
	id := c.Param("id") // ambil :id dari URL

	vendor, err := h.vendorService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    vendor,
	})
}

// Register — POST /api/v1/vendors/register
// Endpoint PROTECTED — user yang sudah login bisa daftar jadi vendor
func (h *VendorHandler) Register(c *gin.Context) {
	var req model.VendorRegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	// Ambil userID dari token (sudah login)
	userID := middleware.GetUserID(c)

	vendor, err := h.vendorService.RegisterAsVendor(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.Response{
		Success: true,
		Message: "berhasil daftar sebagai vendor",
		Data:    vendor,
	})
}

// GetProfile — GET /api/v1/vendors/profile
// Endpoint PROTECTED — vendor lihat profile sendiri
func (h *VendorHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    vendor,
	})
}

// GetBookings — GET /api/v1/vendors/bookings
// Endpoint PROTECTED — vendor lihat booking yang masuk beserta info customer
func (h *VendorHandler) GetBookings(c *gin.Context) {
	userID := middleware.GetUserID(c)

	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	// Pakai versi dengan detail customer (nama, email, telp)
	bookings, err := h.vendorService.GetVendorBookingsWithCustomerDetails(vendor.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data booking",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    bookings,
	})
}

// UpdateProfile — PUT /api/v1/vendors/profile
// Endpoint PROTECTED — vendor update profil bisnis mereka
func (h *VendorHandler) UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	var req struct {
		Name     string   `json:"name" binding:"required,min=3"`
		Bio      string   `json:"bio"`
		Phone    string   `json:"phone" binding:"required"`
		Price    int      `json:"price" binding:"required,gt=0"`
		EtaHours int      `json:"eta_hours" binding:"required,gt=0"`
		Tags     []string `json:"tags"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	if err := h.vendorService.UpdateVendorProfile(vendor.ID, req.Name, req.Bio, req.Phone, req.Price, req.EtaHours); err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal update profil: " + err.Error(),
		})
		return
	}

	if req.Tags != nil {
		_ = h.vendorService.UpdateVendorTags(vendor.ID, req.Tags)
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "profil berhasil diperbarui",
	})
}

// SetAvailability — PUT /api/v1/vendors/availability
// Endpoint PROTECTED — vendor buka/tutup penerimaan booking
func (h *VendorHandler) SetAvailability(c *gin.Context) {
	userID := middleware.GetUserID(c)

	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	var req struct {
		IsAvailable bool `json:"is_available"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid",
		})
		return
	}

	if err := h.vendorService.SetAvailability(vendor.ID, req.IsAvailable); err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal update ketersediaan: " + err.Error(),
		})
		return
	}

	msg := "Anda sekarang menerima booking"
	if !req.IsAvailable {
		msg = "Anda sekarang tidak menerima booking baru"
	}
	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: msg,
	})
}

// AcceptBooking — PUT /api/v1/vendors/bookings/:id/accept
// Endpoint PROTECTED — vendor terima booking
func (h *VendorHandler) AcceptBooking(c *gin.Context) {
	userID := middleware.GetUserID(c)
	bookingID := c.Param("id")

	// Get vendor profile
	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	if err := h.vendorService.AcceptBooking(vendor.ID, bookingID); err != nil {
		status := http.StatusBadRequest
		if err.Error() == "akses ditolak" {
			status = http.StatusForbidden
		}
		c.JSON(status, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "booking diterima",
	})
}

// RejectBooking — PUT /api/v1/vendors/bookings/:id/reject
// Endpoint PROTECTED — vendor tolak booking
func (h *VendorHandler) RejectBooking(c *gin.Context) {
	userID := middleware.GetUserID(c)
	bookingID := c.Param("id")

	// Get vendor profile
	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	if err := h.vendorService.RejectBooking(vendor.ID, bookingID); err != nil {
		status := http.StatusBadRequest
		if err.Error() == "akses ditolak" {
			status = http.StatusForbidden
		}
		c.JSON(status, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "booking ditolak",
	})
}

// CompleteBooking — PUT /api/v1/vendors/bookings/:id/complete
// Endpoint PROTECTED — vendor mark booking as completed
func (h *VendorHandler) CompleteBooking(c *gin.Context) {
	userID := middleware.GetUserID(c)
	bookingID := c.Param("id")

	// Get vendor profile
	vendor, err := h.vendorService.GetVendorProfile(userID)
	if err != nil {
		c.JSON(http.StatusForbidden, model.Response{
			Success: false,
			Message: "anda bukan vendor",
		})
		return
	}

	if err := h.vendorService.CompleteBooking(vendor.ID, bookingID); err != nil {
		status := http.StatusBadRequest
		if err.Error() == "akses ditolak" {
			status = http.StatusForbidden
		}
		c.JSON(status, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Message: "booking selesai",
	})
}
