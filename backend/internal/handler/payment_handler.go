package handler

import (
	"net/http"

	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
)

// PaymentHandler - handler untuk endpoint payment
type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

// GetByBookingID — GET /api/v1/bookings/:id/payment
// PROTECTED — customer bisa lihat info payment dari bookingnya sendiri
func (h *PaymentHandler) GetByBookingID(c *gin.Context) {
	bookingID := c.Param("id")
	customerID := middleware.GetUserID(c)

	payment, err := h.paymentService.GetByBookingID(bookingID, customerID)
	if err != nil {
		status := http.StatusNotFound
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
		Data:    payment,
	})
}
