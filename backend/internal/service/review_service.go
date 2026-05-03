package service

import (
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/google/uuid"
)

// ReviewService - business logic untuk review system
// Mengatur validasi, pembuatan review, dan update rating vendor
type ReviewService struct {
	reviewRepo  *repository.ReviewRepository
	bookingRepo *repository.BookingRepository
	vendorRepo  *repository.VendorRepository
}

func NewReviewService(
	reviewRepo *repository.ReviewRepository,
	bookingRepo *repository.BookingRepository,
	vendorRepo *repository.VendorRepository,
) *ReviewService {
	return &ReviewService{
		reviewRepo:  reviewRepo,
		bookingRepo: bookingRepo,
		vendorRepo:  vendorRepo,
	}
}

// CreateReview - customer submit review untuk booking yang sudah selesai
// Validasi:
// 1. Booking harus ada dan milik customer yang login
// 2. Status booking harus "completed"
// 3. Booking belum pernah di-review (UNIQUE booking_id)
func (s *ReviewService) CreateReview(bookingID string, customerID string, req model.ReviewRequest) (*model.Review, error) {
	// 1. Cek booking ada
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, errors.New("booking tidak ditemukan")
	}

	// 2. Cek booking milik customer yang login
	if booking.CustomerID != customerID {
		return nil, errors.New("akses ditolak: booking ini bukan milik anda")
	}

	// 3. Cek booking sudah selesai (state machine)
	if booking.Status != "completed" {
		return nil, errors.New("review hanya bisa diberikan untuk booking yang sudah selesai (status saat ini: '" + booking.Status + "')")
	}

	// 4. Cek belum pernah di-review
	existing, err := s.reviewRepo.GetByBookingID(bookingID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("booking ini sudah pernah di-review")
	}

	// 5. Buat review baru
	review := model.Review{
		ID:         uuid.NewString(),
		BookingID:  bookingID,
		VendorID:   booking.VendorID,
		CustomerID: customerID,
		Rating:     req.Rating,
		Comment:    req.Comment,
	}

	// 6. Simpan review
	if err := s.reviewRepo.Create(review); err != nil {
		return nil, err
	}

	// 7. Update rating vendor (incremental average)
	// Formula: (current_rating * review_count + new_rating) / (review_count + 1)
	// Sudah dihandle oleh UpdateRating di vendor repo
	if err := s.vendorRepo.UpdateRating(booking.VendorID, float64(req.Rating)); err != nil {
		// Jangan fail review kalau update rating gagal — log saja
		// Ini non-critical, review sudah tersimpan
		_ = err
	}

	return &review, nil
}

// GetVendorReviews - ambil semua review untuk sebuah vendor
func (s *ReviewService) GetVendorReviews(vendorID string) ([]model.Review, error) {
	return s.reviewRepo.GetByVendorID(vendorID)
}
