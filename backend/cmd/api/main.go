package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/daniel/jasa-profesional/config"
	"github.com/daniel/jasa-profesional/internal/handler"
	"github.com/daniel/jasa-profesional/internal/middleware"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/daniel/jasa-profesional/internal/service"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // driver PostgreSQL, _ artinya import tapi tidak dipakai langsung
)

func main() {
	// ── 1. Load konfigurasi dari .env ──────────────────────────────
	cfg := config.Load()

	// ── 2. Koneksi ke PostgreSQL ────────────────────────────────────
	db, err := sql.Open("postgres", cfg.DSN())
	if err != nil {
		log.Fatalf("gagal membuka koneksi database: %v", err)
	}
	defer db.Close()

	// Ping untuk memastikan database benar-benar bisa dijangkau
	if err := db.Ping(); err != nil {
		log.Fatalf("database tidak bisa dijangkau: %v", err)
	}
	fmt.Println("Database terhubung")

	// ── 3. Inisialisasi semua layer (urutan: repo → service → handler) ──
	// Repository
	userRepo := repository.NewUserRepository(db)
	vendorRepo := repository.NewVendorRepository(db)
	bookingRepo := repository.NewBookingRepository(db)

	// Service
	authService := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpireHours)
	vendorService := service.NewVendorService(vendorRepo, userRepo, bookingRepo)
	bookingService := service.NewBookingService(bookingRepo, vendorRepo)
	adminService := service.NewAdminService(userRepo, vendorRepo, bookingRepo)

	// Handler
	authHandler := handler.NewAuthHandler(authService, userRepo)
	vendorHandler := handler.NewVendorHandler(vendorService)
	bookingHandler := handler.NewBookingHandler(bookingService)
	adminHandler := handler.NewAdminHandler(adminService)

	// ── 4. Setup Gin router ─────────────────────────────────────────
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Pasang CORS middleware di semua route
	router.Use(middleware.CORSMiddleware())

	// ── 5. Route PUBLIK — tidak butuh login ─────────────────────────
	public := router.Group("/api/v1")
	{
		// Auth
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)

		// Vendor — siapa pun bisa lihat daftar vendor
		public.GET("/vendors", vendorHandler.GetAll)
		public.GET("/vendors/:id", vendorHandler.GetByID)
	}

	// ── 6. Route PROTECTED — WAJIB login ───────────────────────────
	// Semua route di group ini otomatis melewati middleware AuthRequired
	// Kalau token tidak ada atau tidak valid → langsung 401, handler tidak dijalankan
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		// Auth - user authentication
		protected.GET("/auth/me", authHandler.Me)
		protected.PUT("/auth/profile", authHandler.UpdateProfile)
		protected.PUT("/auth/change-password", authHandler.ChangePassword)
		protected.POST("/auth/logout", authHandler.Logout)

		// Booking - customer booking management
		protected.POST("/bookings", bookingHandler.Create)
		protected.GET("/bookings/my", bookingHandler.GetMyBookings)
		protected.GET("/bookings/:id", bookingHandler.GetByID)

		// Vendor - register and profile
		protected.POST("/vendors/register", vendorHandler.Register)
		protected.GET("/vendors/profile", vendorHandler.GetProfile)

		// Vendor - booking management
		protected.GET("/vendors/bookings", vendorHandler.GetBookings)
		protected.PUT("/vendors/bookings/:id/accept", vendorHandler.AcceptBooking)
		protected.PUT("/vendors/bookings/:id/reject", vendorHandler.RejectBooking)
		protected.PUT("/vendors/bookings/:id/complete", vendorHandler.CompleteBooking)

		// Admin - dashboard dan management
		admin := protected.Group("/admin")
		admin.Use(middleware.AdminRequired())
		{
			admin.GET("/dashboard", adminHandler.GetDashboard)
			admin.GET("/users", adminHandler.GetAllUsers)
			admin.GET("/vendors", adminHandler.GetAllVendors)
		}
	}

	// ── 7. Jalankan server ──────────────────────────────────────────
	addr := ":" + cfg.AppPort
	fmt.Printf("Server berjalan di http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("gagal menjalankan server: %v", err)
	}
}
