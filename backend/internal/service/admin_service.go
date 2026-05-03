package service

import (
	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
)

type AdminService struct {
	userRepo    *repository.UserRepository
	vendorRepo  *repository.VendorRepository
	bookingRepo *repository.BookingRepository
}

func NewAdminService(userRepo *repository.UserRepository, vendorRepo *repository.VendorRepository, bookingRepo *repository.BookingRepository) *AdminService {
	return &AdminService{
		userRepo:    userRepo,
		vendorRepo:  vendorRepo,
		bookingRepo: bookingRepo,
	}
}

// GetDashboardStats - ambil statistik dashboard untuk admin
// Menampilkan overview lengkap tentang sistem
func (s *AdminService) GetDashboardStats() (*model.AdminDashboard, error) {
	// Get all counts menggunakan method COUNT yang lebih efisien
	totalUsers, _ := s.userRepo.CountAll()
	totalVendors, _ := s.vendorRepo.CountAll()
	totalBookings, _ := s.bookingRepo.CountAll()
	totalRevenue, _ := s.bookingRepo.GetTotalRevenue()

	pendingCount, _ := s.bookingRepo.CountByStatus("pending")
	acceptedCount, _ := s.bookingRepo.CountByStatus("accepted")
	completedCount, _ := s.bookingRepo.CountByStatus("completed")

	// Get vendors untuk calculate average rating
	vendors, _ := s.vendorRepo.GetAll("")

	// Get recent bookings untuk activity monitoring
	recentBookings, _ := s.bookingRepo.GetRecentBookings(10)
	if recentBookings == nil {
		recentBookings = []model.Booking{}
	}

	dashboard := &model.AdminDashboard{
		TotalUsers:        totalUsers,
		TotalVendors:      totalVendors,
		TotalBookings:     totalBookings,
		TotalRevenue:      totalRevenue,
		PendingBookings:   pendingCount,
		AcceptedBookings:  acceptedCount,
		CompletedBookings: completedCount,
		AverageRating:     calculateAverageRating(vendors),
		RecentBookings:    recentBookings,
	}

	return dashboard, nil
}

// GetAllUsers - admin bisa lihat semua users
func (s *AdminService) GetAllUsers() ([]model.User, error) {
	users, err := s.userRepo.GetAll()
	if err != nil {
		return nil, err
	}
	if users == nil {
		users = []model.User{}
	}
	return users, nil
}

// GetAllVendors - admin bisa lihat semua vendors
func (s *AdminService) GetAllVendors() ([]model.Vendor, error) {
	vendors, err := s.vendorRepo.GetAll("")
	if err != nil {
		return nil, err
	}
	if vendors == nil {
		vendors = []model.Vendor{}
	}
	return vendors, nil
}

// GetAllBookings - admin bisa lihat semua bookings
func (s *AdminService) GetAllBookings() ([]model.Booking, error) {
	// Query all bookings sorted by created_at DESC
	// Ini akan dipanggil dari endpoint GET /api/v1/admin/bookings
	return []model.Booking{}, nil // TODO: Implement after adding method to BookingRepository
}

// GetBookingsByStatus - filter bookings berdasarkan status
func (s *AdminService) GetBookingsByStatus(status string) ([]model.Booking, error) {
	bookings, err := s.bookingRepo.GetByStatus(status)
	if err != nil {
		return nil, err
	}
	if bookings == nil {
		bookings = []model.Booking{}
	}
	return bookings, nil
}

// GetSystemStats - statistik sistem lengkap untuk advanced admin dashboard
type SystemStats struct {
	TotalUsers        int
	TotalVendors      int
	TotalCustomers    int
	TotalBookings     int
	TotalRevenue      int
	AverageOrderValue float64
	CompletionRate    float64
	AverageRating     float64
}

// GetSystemStats - ambil statistik sistem yang lebih detail
func (s *AdminService) GetSystemStatsDetailed() (*SystemStats, error) {
	totalUsers, _ := s.userRepo.CountAll()
	totalVendors, _ := s.vendorRepo.CountAll()

	// Count customers (users dengan role = customer)
	// TODO: Implement CountByRole method di UserRepository

	totalBookings, _ := s.bookingRepo.CountAll()
	completedCount, _ := s.bookingRepo.CountByStatus("completed")
	totalRevenue, _ := s.bookingRepo.GetTotalRevenue()

	vendors, _ := s.vendorRepo.GetAll("")

	var avgOrderValue float64
	if totalBookings > 0 {
		avgOrderValue = float64(totalRevenue) / float64(totalBookings)
	}

	var completionRate float64
	if totalBookings > 0 {
		completionRate = float64(completedCount) / float64(totalBookings) * 100
	}

	stats := &SystemStats{
		TotalUsers:        totalUsers,
		TotalVendors:      totalVendors,
		TotalBookings:     totalBookings,
		TotalRevenue:      totalRevenue,
		AverageOrderValue: avgOrderValue,
		CompletionRate:    completionRate,
		AverageRating:     calculateAverageRating(vendors),
	}

	return stats, nil
}

// calculateAverageRating - hitung rata-rata rating dari semua vendor
func calculateAverageRating(vendors []model.Vendor) float64 {
	if len(vendors) == 0 {
		return 0
	}

	totalRating := 0.0
	for _, v := range vendors {
		totalRating += v.Rating
	}

	return totalRating / float64(len(vendors))
}
