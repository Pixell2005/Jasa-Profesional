package service

import (
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
)

// PaymentService - business logic untuk payment tracking
// Sistem ini bersifat record-keeping (tracking status pembayaran)
// Integrasi payment gateway bisa ditambahkan di sini nanti
type PaymentService struct {
	paymentRepo *repository.PaymentRepository
	bookingRepo *repository.BookingRepository
}

func NewPaymentService(
	paymentRepo *repository.PaymentRepository,
	bookingRepo *repository.BookingRepository,
) *PaymentService {
	return &PaymentService{
		paymentRepo: paymentRepo,
		bookingRepo: bookingRepo,
	}
}

// GetByBookingID - ambil info payment untuk sebuah booking
// Memvalidasi bahwa booking milik customer yang request
func (s *PaymentService) GetByBookingID(bookingID string, customerID string) (*model.Payment, error) {
	// 1. Pastikan booking ada dan milik customer yang login
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, errors.New("booking tidak ditemukan")
	}
	if booking.CustomerID != customerID {
		return nil, errors.New("akses ditolak")
	}

	// 2. Ambil data payment
	payment, err := s.paymentRepo.GetByBookingID(bookingID)
	if err != nil {
		return nil, err
	}
	// Belum ada payment record untuk booking ini
	if payment == nil {
		return nil, errors.New("belum ada record pembayaran untuk booking ini")
	}

	return payment, nil
}
