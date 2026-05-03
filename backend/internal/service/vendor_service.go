package service

import (
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/google/uuid"
)

type VendorService struct {
	vendorRepo  *repository.VendorRepository
	userRepo    *repository.UserRepository
	bookingRepo *repository.BookingRepository
}

func NewVendorService(vendorRepo *repository.VendorRepository, userRepo *repository.UserRepository, bookingRepo *repository.BookingRepository) *VendorService {
	return &VendorService{
		vendorRepo:  vendorRepo,
		userRepo:    userRepo,
		bookingRepo: bookingRepo,
	}
}

// GetAllVendors - mengambil semua vendor, bisa filter by category
func (s *VendorService) GetAll(category string) ([]model.Vendor, error) {
	vendors, err := s.vendorRepo.GetAll(category)
	if err != nil {
		return nil, err
	}
	// Kalau tidak ada vendor, return empty slice, bukan nil
	if vendors == nil {
		vendors = []model.Vendor{}
	}
	return vendors, nil
}

// GetVendorByID - mengambil vendor berdasarkan ID
func (s *VendorService) GetByID(id string) (*model.Vendor, error) {
	vendor, err := s.vendorRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if vendor == nil {
		return nil, errors.New("vendor not found")
	}
	return vendor, nil
}

// RegisterAsVendor - mendaftarkan user yang sudah ada menjadi vendor
func (s *VendorService) RegisterAsVendor(userID string, req model.VendorRegisterRequest) (*model.Vendor, error) {
	// 1. Check user exists
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user tidak ditemukan")
	}

	// 2. Check apakah user sudah terdaftar sebagai vendor
	existingVendor, err := s.vendorRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if existingVendor != nil {
		return nil, errors.New("user sudah terdaftar sebagai vendor")
	}

	// 3. Buat vendor baru
	vendor := model.Vendor{
		ID:          uuid.New().String(),
		UserID:      userID,
		Name:        req.Name,
		Category:    req.Category,
		Bio:         req.Bio,
		Phone:       req.Phone,
		Price:       req.Price,
		EtaHours:    req.EtaHours,
		Tags:        req.Tags,
		IsAvailable: true,
	}

	// 4. Update user role menjadi vendor
	err = s.userRepo.UpdateRole(userID, "vendor")
	if err != nil {
		return nil, err
	}

	// 5. Simpan vendor ke database
	if err := s.vendorRepo.Create(vendor); err != nil {
		// Rollback user role update jika vendor creation gagal
		s.userRepo.UpdateRole(userID, "customer")
		return nil, err
	}

	return &vendor, nil
}

// GetVendorProfile - ambil profile lengkap vendor berdasarkan user ID
func (s *VendorService) GetVendorProfile(userID string) (*model.Vendor, error) {
	vendor, err := s.vendorRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	if vendor == nil {
		return nil, errors.New("vendor tidak ditemukan")
	}
	return vendor, nil
}

// GetVendorBookings - ambil semua booking untuk vendor
func (s *VendorService) GetVendorBookings(vendorID string) ([]model.Booking, error) {
	bookings, err := s.bookingRepo.GetByVendorID(vendorID)
	if err != nil {
		return nil, err
	}
	if bookings == nil {
		bookings = []model.Booking{}
	}
	return bookings, nil
}

// AcceptBooking - vendor accept booking
// State machine: hanya booking dengan status 'pending' yang bisa di-accept
func (s *VendorService) AcceptBooking(vendorID, bookingID string) error {
	// Verify booking exists dan belongs to vendor
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return errors.New("booking tidak ditemukan")
	}
	if booking.VendorID != vendorID {
		return errors.New("akses ditolak")
	}
	// State machine guard
	if booking.Status != "pending" {
		return errors.New("hanya booking berstatus 'pending' yang bisa diterima (status sekarang: '" + booking.Status + "')")
	}

	return s.bookingRepo.UpdateStatus(bookingID, "accepted")
}

// RejectBooking - vendor reject booking
// State machine: hanya booking dengan status 'pending' yang bisa di-reject
func (s *VendorService) RejectBooking(vendorID, bookingID string) error {
	// Verify booking exists dan belongs to vendor
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return errors.New("booking tidak ditemukan")
	}
	if booking.VendorID != vendorID {
		return errors.New("akses ditolak")
	}
	// State machine guard
	if booking.Status != "pending" {
		return errors.New("hanya booking berstatus 'pending' yang bisa ditolak (status sekarang: '" + booking.Status + "')")
	}

	return s.bookingRepo.UpdateStatus(bookingID, "rejected")
}

// CompleteBooking - vendor mark booking as completed
// State machine: hanya booking dengan status 'accepted' yang bisa di-complete
func (s *VendorService) CompleteBooking(vendorID, bookingID string) error {
	// Verify booking exists dan belongs to vendor
	booking, err := s.bookingRepo.GetByID(bookingID)
	if err != nil {
		return err
	}
	if booking == nil {
		return errors.New("booking tidak ditemukan")
	}
	if booking.VendorID != vendorID {
		return errors.New("akses ditolak")
	}
	// State machine guard: harus sudah accepted dulu sebelum bisa completed
	if booking.Status != "accepted" {
		return errors.New("hanya booking berstatus 'accepted' yang bisa diselesaikan (status sekarang: '" + booking.Status + "')")
	}

	return s.bookingRepo.UpdateStatus(bookingID, "completed")
}

// GetVendorBookingsWithCustomerDetails - ambil booking vendor dengan detail customer
// FIX: Sebelumnya N+1 query (1 query utama + 1 per booking)
// Sekarang menggunakan satu JOIN query langsung dari repo
func (s *VendorService) GetVendorBookingsWithCustomerDetails(vendorID string) ([]model.BookingWithCustomer, error) {
	return s.bookingRepo.GetAllByVendorIDWithCustomerDetails(vendorID)
}

// UpdateVendorProfile - update profil vendor
func (s *VendorService) UpdateVendorProfile(vendorID string, name string, bio string, phone string, price int, etaHours int) error {
	return s.vendorRepo.UpdateProfile(vendorID, name, bio, phone, price, etaHours)
}

// UpdateVendorTags - update tags vendor
func (s *VendorService) UpdateVendorTags(vendorID string, tags []string) error {
	return s.vendorRepo.UpdateTags(vendorID, tags)
}

// SetAvailability - ubah status ketersediaan vendor
func (s *VendorService) SetAvailability(vendorID string, isAvailable bool) error {
	return s.vendorRepo.UpdateAvailability(vendorID, isAvailable)
}

// GetTopRatedVendors - ambil vendor dengan rating tertinggi (featured)
func (s *VendorService) GetTopRatedVendors(limit int) ([]model.Vendor, error) {
	if limit <= 0 {
		limit = 5
	}
	return s.vendorRepo.GetTopRatedVendors(limit)
}

// GetVendorsByCategory - ambil vendor berdasarkan kategori
func (s *VendorService) GetVendorsByCategory(category string, limit int) ([]model.Vendor, error) {
	vendors, err := s.vendorRepo.GetAll(category)
	if err != nil {
		return nil, err
	}

	if limit > 0 && len(vendors) > limit {
		vendors = vendors[:limit]
	}

	return vendors, nil
}
