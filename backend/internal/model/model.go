package model

import "time"

// ============================================================
// USER MODEL - Merepresentasikan tabel users di database
// ============================================================
// User adalah entitas dasar untuk authentication dan profil user.
// Setiap user bisa menjadi customer atau vendor.

type User struct {
	// ID: UUID unik untuk setiap user, di-generate otomatis oleh database
	ID string `json:"id" db:"id"`

	// Email: Email unik user, digunakan untuk login
	// Harus unik di database (UNIQUE constraint)
	Email string `json:"email" db:"email"`

	// Password: Hash password menggunakan bcrypt, TIDAK pernah di-expose ke API
	// Nilai: $2a$10$... (bcrypt hash format)
	Password string `json:"-" db:"password"`

	// Name: Nama lengkap user (customer/vendor)
	Name string `json:"name" db:"name"`

	// Role: Role user dalam sistem
	// Possible values: "customer", "vendor", "admin"
	// Default: "customer"
	Role string `json:"role" db:"role"`

	// IsActive: Status aktif user
	// True: user aktif dan bisa login
	// False: user ter-suspend atau ter-deactivate
	IsActive bool `json:"is_active" db:"is_active"`

	// CreatedAt: Timestamp pembuatan akun
	// Di-set otomatis oleh database
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// UpdatedAt: Timestamp update terakhir
	// Di-update otomatis setiap ada perubahan data
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// LastLoginAt: Timestamp login terakhir
	// Null jika user belum pernah login
	// Useful untuk audit dan monitoring
	LastLoginAt *time.Time `json:"last_login_at,omitempty" db:"last_login_at"`

	// LastLogoutAt: Timestamp logout terakhir
	// Null jika user belum pernah logout
	LastLogoutAt *time.Time `json:"last_logout_at,omitempty" db:"last_logout_at"`

	// LoginCount: Jumlah total login user
	// Di-increment setiap login sukses
	LoginCount int `json:"login_count" db:"login_count"`

	// LastIP: IP address dari login terakhir
	// Digunakan untuk security monitoring
	// Null jika belum pernah login
	LastIP *string `json:"last_ip,omitempty" db:"last_ip"`
}

// ============================================================
// VENDOR MODEL - Merepresentasikan tabel vendors di database
// ============================================================
// Vendor adalah service provider yang menawarkan layanan.
// Setiap vendor terikat ke satu user (one-to-one relationship).

type Vendor struct {
	// ID: UUID unik untuk vendor, di-generate otomatis
	ID string `json:"id" db:"id"`

	// UserID: Foreign key ke tabel users
	// Merupakan user yang ter-register sebagai vendor
	UserID string `json:"user_id" db:"user_id"`

	// Name: Nama bisnis/toko vendor
	// Bisa berbeda dari User.Name
	Name string `json:"name" db:"name"`

	// Role: Spesialisasi vendor (misalnya: "cleaning", "repair", "tutoring")
	// Format: lowercase, single word atau hyphenated
	Role string `json:"role" db:"role"`

	// Category: Kategori utama layanan
	// Grouping untuk frontend filtering
	// Possible values: "cleaning", "maintenance", "services", dst
	Category string `json:"category" db:"category"`

	// Tags: Array tag untuk SEO dan filtering
	// Contoh: ["fast", "reliable", "trusted", "24h"]
	Tags []string `json:"tags" db:"tags"`

	// Bio: Deskripsi singkat tentang vendor/layanan
	// Max 500 characters recommended
	Bio string `json:"bio" db:"bio"`

	// Phone: Nomor telepon vendor
	// Format: direkomendasikan dengan kode negara (+62...)
	Phone string `json:"phone" db:"phone"`

	// Rating: Rating rata-rata dari customer reviews
	// Range: 0.0 - 5.0, precision: 1 decimal
	// Calculated: total rating points / review count
	Rating float64 `json:"rating" db:"rating"`

	// ReviewCount: Jumlah total ulasan dari customer
	// Di-increment setiap ada review baru
	ReviewCount int `json:"review_count" db:"review_count"`

	// Price: Harga dasar per layanan (dalam Rupiah)
	// Admin fee ditambahkan pada saat booking
	Price int `json:"price" db:"price"`

	// EtaHours: Estimasi waktu pengerjaan (dalam jam)
	// Contoh: 2 jam, 4 jam, 8 jam
	EtaHours int `json:"eta_hours" db:"eta_hours"`

	// IsAvailable: Status ketersediaan vendor
	// True: vendor menerima booking baru
	// False: vendor sedang offline atau penuh
	IsAvailable bool `json:"is_available" db:"is_available"`

	// CreatedAt: Timestamp vendor registration
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// UpdatedAt: Timestamp update terakhir
	UpdatedAt *time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

// ============================================================
// BOOKING MODEL - Merepresentasikan tabel bookings di database
// ============================================================
// Booking adalah order/pesanan dari customer ke vendor.
// Lifecycle: pending → accepted → completed / rejected

type Booking struct {
	// ID: UUID unik untuk setiap booking
	ID string `json:"id" db:"id"`

	// VendorID: Foreign key ke tabel vendors
	// Vendor yang dipilih customer untuk layanan
	VendorID string `json:"vendor_id" db:"vendor_id"`

	// CustomerID: Foreign key ke tabel users
	// User (customer) yang membuat booking
	CustomerID string `json:"customer_id" db:"customer_id"`

	// ServiceDate: Tanggal layanan diinginkan
	// Format: YYYY-MM-DD (ISO 8601)
	// Validasi: tidak boleh di masa lalu
	ServiceDate string `json:"service_date" db:"service_date"`

	// ServiceTime: Waktu layanan diinginkan
	// Format: HH:MM (24-hour format)
	// Contoh: "14:30", "09:00"
	ServiceTime string `json:"service_time" db:"service_time"`

	// Address: Alamat lengkap untuk layanan
	// Bisa berbeda dari alamat profil customer
	// Contoh: "Jl. Sudirman No. 42, Jakarta Pusat"
	Address string `json:"address" db:"address"`

	// Notes: Catatan tambahan dari customer
	// Untuk informasi khusus tentang layanan yang diinginkan
	// Bersifat optional
	Notes string `json:"notes" db:"notes"`

	// Status: Status booking dalam lifecycle
	// Possible values:
	// - "pending": menunggu vendor accept/reject
	// - "accepted": vendor sudah accept, tinggal menunggu hari service
	// - "in_progress": vendor sedang mengerjakan
	// - "completed": layanan sudah selesai, menunggu rating
	// - "rejected": vendor reject booking
	// - "cancelled": customer cancel booking
	Status string `json:"status" db:"status"`

	// TotalPrice: Total harga yang harus dibayar
	// Calculation: vendor.price + admin_fee
	// Dalam Rupiah (IDR)
	TotalPrice int `json:"total_price" db:"total_price"`

	// AdminFee: Komisi/biaya admin sistem
	// Default: 10000 (Rp 10.000)
	// Bisa di-adjust sesuai kebijakan
	AdminFee int `json:"admin_fee" db:"admin_fee"`

	// CreatedAt: Timestamp pembuatan booking
	CreatedAt time.Time `json:"created_at" db:"created_at"`

	// UpdatedAt: Timestamp update terakhir (status change, notes, dll)
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// ============================================================
// REQUEST & RESPONSE MODELS
// ============================================================

// RegisterRequest: Payload untuk POST /api/v1/auth/register
type RegisterRequest struct {
	// Name: Nama lengkap user
	// Validation: required, min 3 chars, max 100 chars
	Name string `json:"name" binding:"required,min=3,max=100"`

	// Email: Email unik untuk user
	// Validation: required, must be valid email format
	Email string `json:"email" binding:"required,email"`

	// Password: Password untuk akun user
	// Validation: required, min 8 chars
	// Security: akan di-hash dengan bcrypt sebelum disimpan
	Password string `json:"password" binding:"required,min=8"`
}

// LoginRequest: Payload untuk POST /api/v1/auth/login
type LoginRequest struct {
	// Email: Email user
	Email string `json:"email" binding:"required,email"`

	// Password: Password user
	// Note: password ini akan dibandingkan dengan hash di database
	Password string `json:"password" binding:"required"`
}

// LoginResponse: Response untuk POST /api/v1/auth/login
type LoginResponse struct {
	// Token: JWT token untuk authentication
	// Format: Bearer <token>
	// Digunakan di header Authorization request berikutnya
	Token string `json:"token"`

	// User: Data user yang berhasil login
	// Password field akan kosong (tidak di-expose)
	User User `json:"user"`
}

// BookingRequest: Payload untuk POST /api/v1/bookings
type BookingRequest struct {
	// VendorID: ID vendor yang dipilih
	VendorID string `json:"vendor_id" binding:"required"`

	// ServiceDate: Tanggal layanan
	// Format: YYYY-MM-DD
	ServiceDate string `json:"service_date" binding:"required"`

	// ServiceTime: Waktu layanan
	// Format: HH:MM
	ServiceTime string `json:"service_time" binding:"required"`

	// Address: Alamat layanan
	Address string `json:"address" binding:"required"`

	// Notes: Catatan tambahan (optional)
	Notes string `json:"notes"`
}

// VendorRegisterRequest: Payload untuk POST /api/v1/vendors/register
type VendorRegisterRequest struct {
	// Name: Nama bisnis vendor
	Name string `json:"name" binding:"required,min=3"`

	// Category: Kategori layanan
	Category string `json:"category" binding:"required"`

	// Bio: Deskripsi singkat (optional)
	Bio string `json:"bio"`

	// Phone: Nomor telepon vendor
	Phone string `json:"phone" binding:"required"`

	// Price: Harga dasar layanan per order (dalam Rupiah)
	Price int `json:"price" binding:"required,gt=0"`

	// EtaHours: Estimasi waktu pengerjaan (dalam jam)
	EtaHours int `json:"eta_hours" binding:"required,gt=0"`

	// Tags: Array tag/skill vendor (optional)
	Tags []string `json:"tags"`
}

// UpdateBookingStatusRequest: Payload untuk PUT /api/v1/vendors/bookings/:id/[accept|reject|complete]
type UpdateBookingStatusRequest struct {
	// Status: Status baru untuk booking
	// Possible values: "accepted", "rejected", "completed"
	Status string `json:"status" binding:"required"`

	// Notes: Catatan dari vendor (optional)
	// Berguna untuk reject reason atau completion notes
	Notes string `json:"notes"`
}

// BookingWithCustomer: Response dengan detail customer untuk vendor dashboard
// Digunakan di vendor bookings listing
type BookingWithCustomer struct {
	// ID: Booking ID
	ID string `json:"id"`

	// VendorID: Vendor ID
	VendorID string `json:"vendor_id"`

	// CustomerID: Customer ID
	CustomerID string `json:"customer_id"`

	// CustomerName: Nama customer yang booking
	CustomerName string `json:"customer_name"`

	// CustomerEmail: Email customer
	CustomerEmail string `json:"customer_email"`

	// CustomerPhone: Nomor telepon customer
	CustomerPhone string `json:"customer_phone"`

	// ServiceDate: Tanggal layanan
	ServiceDate string `json:"service_date"`

	// ServiceTime: Waktu layanan
	ServiceTime string `json:"service_time"`

	// Address: Alamat layanan
	Address string `json:"address"`

	// Notes: Catatan dari customer
	Notes string `json:"notes"`

	// Status: Status booking
	Status string `json:"status"`

	// TotalPrice: Total harga
	TotalPrice int `json:"total_price"`

	// AdminFee: Biaya admin
	AdminFee int `json:"admin_fee"`

	// CreatedAt: Waktu booking dibuat
	CreatedAt time.Time `json:"created_at"`

	// UpdatedAt: Waktu update terakhir
	UpdatedAt time.Time `json:"updated_at"`
}

// AdminDashboard: Dashboard statistics untuk admin
type AdminDashboard struct {
	// TotalUsers: Jumlah total users di sistem
	TotalUsers int `json:"total_users"`

	// TotalVendors: Jumlah total vendors di sistem
	TotalVendors int `json:"total_vendors"`

	// TotalBookings: Jumlah total bookings (semua status)
	TotalBookings int `json:"total_bookings"`

	// TotalRevenue: Total revenue dari semua completed bookings
	// Dalam Rupiah (IDR)
	TotalRevenue int `json:"total_revenue"`

	// PendingBookings: Jumlah booking dengan status pending
	PendingBookings int `json:"pending_bookings"`

	// AcceptedBookings: Jumlah booking dengan status accepted
	AcceptedBookings int `json:"accepted_bookings"`

	// CompletedBookings: Jumlah booking dengan status completed
	CompletedBookings int `json:"completed_bookings"`

	// AverageRating: Rating rata-rata dari semua vendors
	AverageRating float64 `json:"average_rating"`

	// RecentBookings: Booking terakhir (recent activity)
	// Untuk monitoring real-time dashboard
	RecentBookings []Booking `json:"recent_bookings"`
}

// Response: Generic API response wrapper
// Setiap endpoint API menggunakan struktur ini untuk consistency
type Response struct {
	// Success: Boolean flag apakah request sukses atau error
	// True: request berhasil diproses
	// False: ada error
	Success bool `json:"success"`

	// Message: Pesan deskriptif hasil operation (optional)
	// Diisi untuk error messages atau success confirmations
	Message string `json:"message,omitempty"`

	// Data: Payload data hasil operation (optional)
	// Diisi jika Success=true dan ada data yang dikembalikan
	Data interface{} `json:"data,omitempty"`
}
