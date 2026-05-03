package service

import (
	"errors"
	"time"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/google/uuid"
)

type BookingService struct {
	bookingRepo *repository.BookingRepository
	vendorRepo  *repository.VendorRepository
}

func NewBookingService(
	bookingRepo *repository.BookingRepository,
	vendorRepo *repository.VendorRepository,
) *BookingService {
	return &BookingService{
		bookingRepo: bookingRepo,
		vendorRepo:  vendorRepo,
	}
}

// CreateBooking - membuat booking baru
// customerID diambil dari JWT token(middleware), bukan dari request body
func (s *BookingService) Create(customerID string, req model.BookingRequest) (*model.Booking, error) {
	// 1. Pastikan vendor yang dipilih ada
	vendor, err := s.vendorRepo.GetByID(req.VendorID)
	if err != nil {
		return nil, err
	}
	if vendor == nil {
		return nil, errors.New("vendor not found")
	}
	if !vendor.IsAvailable {
		return nil, errors.New("vendor is not available")
	}

	// 2. Validasi tanggal - tidak boleh sudah lewat
	serviceDate, err := time.Parse("2006-01-02", req.ServiceDate)
	if err != nil {
		return nil, errors.New("invalid service date format, expected YYYY-MM-DD")
	}
	today := time.Now().Truncate(24 * time.Hour)
	if serviceDate.Before(today) {
		return nil, errors.New("service date cannot be in the past")
	}

	// 3. Hitung total price (harga vendor + admin fee) !dari backend
	const adminFee = 10000
	totalPrice := vendor.Price + adminFee

	// 4. Buat struct booking
	booking := model.Booking{
		ID:          uuid.NewString(),
		VendorID:    req.VendorID,
		CustomerID:  customerID, // dari token JWT, bukan dari request body
		ServiceDate: req.ServiceDate,
		ServiceTime: req.ServiceTime,
		Address:     req.Address,
		Notes:       req.Notes,
		Status:      "pending",
		TotalPrice:  totalPrice,
		AdminFee:    adminFee,
	}

	// 5. Simpan ke database
	if err := s.bookingRepo.Create(booking); err != nil {
		return nil, err
	}
	return &booking, nil
}

// GetByID - ambil booking berdasarkan ID
// Hanya booking milik customer yang sedang login yang bisa diakses
func (s *BookingService) GetByID(id string, customerID string) (*model.Booking, error) {
	booking, err := s.bookingRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, errors.New("booking not found")
	}
	// Cek apakah booking ini milik customer yang sedang login
	if booking.CustomerID != customerID {
		return nil, errors.New("akses ditolak")
	}
	return booking, nil
}

// GetMyBookings - ambil semua booking milik customer yang sedang login
func (s *BookingService) GetMyBookings(customerID string) ([]model.Booking, error) {
	bookings, err := s.bookingRepo.GetByCustomerID(customerID)
	if err != nil {
		return nil, err
	}
	if bookings == nil {
		bookings = []model.Booking{} // kembalikan slice kosong jika tidak ada booking
	}
	return bookings, nil
}
