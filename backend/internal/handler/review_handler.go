package handler

import (
	"net/http"

	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
)

// ReviewHandler - handler untuk endpoint review
type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviewService: reviewService}
}

// CreateReview — POST /api/v1/bookings/:id/review
// PROTECTED — customer submit review untuk booking miliknya yang sudah completed
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	bookingID := c.Param("id")
	customerID := middleware.GetUserID(c)

	var req model.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Success: false,
			Message: "data tidak valid: " + err.Error(),
		})
		return
	}

	review, err := h.reviewService.CreateReview(bookingID, customerID, req)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "akses ditolak: booking ini bukan milik anda" {
			status = http.StatusForbidden
		}
		c.JSON(status, model.Response{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.Response{
		Success: true,
		Message: "review berhasil dikirim",
		Data:    review,
	})
}

// GetVendorReviews — GET /api/v1/vendors/:id/reviews
// PROTECTED — siapa pun yang login bisa lihat review vendor
func (h *ReviewHandler) GetVendorReviews(c *gin.Context) {
	vendorID := c.Param("id")

	reviews, err := h.reviewService.GetVendorReviews(vendorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Success: false,
			Message: "gagal mengambil data review",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Success: true,
		Data:    reviews,
	})
}
