package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/service"
)

type BookingHandler struct {
	bookingService *service.BookingService
}

func NewBookingHandler(bookingService *service.BookingService) *BookingHandler {
	return &BookingHandler{bookingService: bookingService}
}

// CreateBooking - POST /api/v1/bookings
// Endpoint ini butuh token JWT, sehingga bisa dapat customerID dari middleware
// Harus login dulu
func (h *BookingHandler) Create(c *gin.Context){
	var req model.BookingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	// Ambil customerID dari token JWT yang sudah diverifikasi oleh middleware
	// Tidak diambil dari request body, karena itu bisa dimanipulasi oleh client
	customerID := middleware.GetUserID(c)

	booking, err := h.bookingService.Create(customerID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.Response{
		Success: true,
		Message: "booking berhasil dibuat",
		Data:    booking,
	})
}


// GetByID - GET /api/v1/bookings/:id
// PROTECTED: hanya pemilik booking yang bisa akses
func (h *BookingHandler) GetByID(c *gin.Context){
	id := c.Param("id")
	customerID := middleware.GetUserID(c)

	// Service akan cek apakah booking ini milik customerID yang sedang login
	booking, err := h.bookingService.GetByID(id, customerID)
	if err != nil {
		status := http.StatusNotFound
		if err.Error() == "akses ditolak" {
			status = http.StatusForbidden // 403 kalau bukan miliknya
		}
		c.JSON(status, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:	booking,
	})
}

// GetMyBookings - GET /api/v1/bookings/customer
// PROTECTED: hanya bisa akses booking miliknya sendiri
func (h *BookingHandler) GetMyBookings(c *gin.Context) {
	customerID := middleware.GetUserID(c)

	bookings, err := h.bookingService.GetMyBookings(customerID)
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

// CancelBooking - DELETE /api/v1/bookings/:id/cancel
// PROTECTED: customer cancel booking miliknya sendiri (hanya pending/accepted)
func (h *BookingHandler) CancelBooking(c *gin.Context) {
	id := c.Param("id")
	customerID := middleware.GetUserID(c)

	var body struct {
		Reason string `json:"reason"`
	}
	// Reason bersifat optional, tidak masalah jika bind gagal
	_ = c.ShouldBindJSON(&body)

	if err := h.bookingService.CancelBooking(id, customerID, body.Reason); err != nil {
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
		Message: "booking berhasil dibatalkan",
	})
}