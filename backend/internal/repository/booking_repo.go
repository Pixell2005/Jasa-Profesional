package repository

import (
	"database/sql"
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
)

type BookingRepository struct {
	db *sql.DB
}

func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

// Create - menyimpan booking baru ke database
func (r *BookingRepository) Create(booking model.Booking) error {
	query := `
		INSERT INTO bookings
			(id, vendor_id, customer_id, service_date, service_time,
			address, notes, status, total_price, admin_fee)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(query,
		booking.ID,
		booking.VendorID,
		booking.CustomerID,
		booking.ServiceDate,
		booking.ServiceTime,
		booking.Address,
		booking.Notes,
		booking.Status,
		booking.TotalPrice,
		booking.AdminFee,
	)
	return err
}

// GetByID - mencari booking berdasarkan ID
func (r *BookingRepository) GetByID(id string) (*model.Booking, error) {
	query := `
			SELECT id, vendor_id, customer_id, service_date, service_time,
				   address, notes, status, total_price, admin_fee, created_at, updated_at
			FROM bookings
			WHERE id = $1
	`
	b := &model.Booking{}
	err := r.db.QueryRow(query, id).Scan(
		&b.ID, &b.VendorID, &b.CustomerID,
		&b.ServiceDate, &b.ServiceTime, &b.Address, &b.Notes,
		&b.Status, &b.TotalPrice, &b.AdminFee,
		&b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return b, nil
}

// GetByCustomerID - mencari semua booking berdasarkan ID customer
// Dipakai di endpoint GET /bookings/customer untuk menampilkan riwayat booking customer
func (r *BookingRepository) GetByCustomerID(customerID string) ([]model.Booking, error) {
	query := `
			SELECT id, vendor_id, customer_id, service_date, service_time,
				   address, notes, status, total_price, admin_fee, created_at, updated_at
			FROM bookings
			WHERE customer_id = $1
			ORDER BY created_at DESC
		`
	rows, err := r.db.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []model.Booking
	for rows.Next() {
		var b model.Booking
		err := rows.Scan(
			&b.ID, &b.VendorID, &b.CustomerID,
			&b.ServiceDate, &b.ServiceTime, &b.Address, &b.Notes,
			&b.Status, &b.TotalPrice, &b.AdminFee, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// UpdateStatus - ubah status booking (pending -> confirmed -> completed, dll)
func (r *BookingRepository) UpdateStatus(id, status string) error {
	query := `
		UPDATE bookings
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, status, id)
	return err
}

// GetByVendorID - ambil semua booking berdasarkan vendor ID (untuk vendor dashboard)
func (r *BookingRepository) GetByVendorID(vendorID string) ([]model.Booking, error) {
	query := `
		SELECT id, vendor_id, customer_id, service_date, service_time,
			   address, notes, status, total_price, admin_fee, created_at, updated_at
		FROM bookings
		WHERE vendor_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, vendorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []model.Booking
	for rows.Next() {
		var b model.Booking
		err := rows.Scan(
			&b.ID, &b.VendorID, &b.CustomerID,
			&b.ServiceDate, &b.ServiceTime, &b.Address, &b.Notes,
			&b.Status, &b.TotalPrice, &b.AdminFee, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// GetWithCustomerDetails - ambil booking dengan detail customer
func (r *BookingRepository) GetWithCustomerDetails(bookingID string) (*model.BookingWithCustomer, error) {
	query := `
		SELECT 
			b.id, b.vendor_id, b.customer_id, u.name, u.email, 
			b.service_date, b.service_time, b.address, b.notes, 
			b.status, b.total_price, b.admin_fee, b.created_at, b.updated_at,
			u.phone
		FROM bookings b
		JOIN users u ON b.customer_id = u.id
		WHERE b.id = $1
	`
	bwc := &model.BookingWithCustomer{}
	err := r.db.QueryRow(query, bookingID).Scan(
		&bwc.ID, &bwc.VendorID, &bwc.CustomerID, &bwc.CustomerName, &bwc.CustomerEmail,
		&bwc.ServiceDate, &bwc.ServiceTime, &bwc.Address, &bwc.Notes,
		&bwc.Status, &bwc.TotalPrice, &bwc.AdminFee, &bwc.CreatedAt, &bwc.UpdatedAt,
		&bwc.CustomerPhone,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return bwc, nil
}

// GetByStatus - ambil booking berdasarkan status
func (r *BookingRepository) GetByStatus(status string) ([]model.Booking, error) {
	query := `
		SELECT id, vendor_id, customer_id, service_date, service_time,
		       address, notes, status, total_price, admin_fee, created_at, updated_at
		FROM bookings
		WHERE status = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []model.Booking
	for rows.Next() {
		var b model.Booking
		err := rows.Scan(
			&b.ID, &b.VendorID, &b.CustomerID,
			&b.ServiceDate, &b.ServiceTime, &b.Address, &b.Notes,
			&b.Status, &b.TotalPrice, &b.AdminFee, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// GetRecentBookings - ambil booking terbaru (untuk admin dashboard)
func (r *BookingRepository) GetRecentBookings(limit int) ([]model.Booking, error) {
	query := `
		SELECT id, vendor_id, customer_id, service_date, service_time,
		       address, notes, status, total_price, admin_fee, created_at, updated_at
		FROM bookings
		ORDER BY created_at DESC
		LIMIT $1
	`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []model.Booking
	for rows.Next() {
		var b model.Booking
		err := rows.Scan(
			&b.ID, &b.VendorID, &b.CustomerID,
			&b.ServiceDate, &b.ServiceTime, &b.Address, &b.Notes,
			&b.Status, &b.TotalPrice, &b.AdminFee, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}

// CountByStatus - hitung booking berdasarkan status
func (r *BookingRepository) CountByStatus(status string) (int, error) {
	query := `SELECT COUNT(*) FROM bookings WHERE status = $1`
	var count int
	err := r.db.QueryRow(query, status).Scan(&count)
	return count, err
}

// CountAll - hitung total booking
func (r *BookingRepository) CountAll() (int, error) {
	query := `SELECT COUNT(*) FROM bookings`
	var count int
	err := r.db.QueryRow(query).Scan(&count)
	return count, err
}

// GetTotalRevenue - hitung total revenue dari completed bookings
func (r *BookingRepository) GetTotalRevenue() (int, error) {
	query := `
		SELECT COALESCE(SUM(total_price), 0) FROM bookings
		WHERE status = 'completed'
	`
	var revenue int
	err := r.db.QueryRow(query).Scan(&revenue)
	return revenue, err
}

// GetRevenueByVendor - hitung revenue per vendor
func (r *BookingRepository) GetRevenueByVendor(vendorID string) (int, error) {
	query := `
		SELECT COALESCE(SUM(total_price), 0) FROM bookings
		WHERE vendor_id = $1 AND status = 'completed'
	`
	var revenue int
	err := r.db.QueryRow(query, vendorID).Scan(&revenue)
	return revenue, err
}

// UpdateNotes - update notes/catatan booking
func (r *BookingRepository) UpdateNotes(bookingID string, notes string) error {
	query := `
		UPDATE bookings
		SET notes = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, notes, bookingID)
	return err
}

// Cancel - cancel booking (ubah status ke cancelled)
func (r *BookingRepository) Cancel(bookingID string, reason string) error {
	query := `
		UPDATE bookings
		SET status = 'cancelled',
		    notes = $1,
		    updated_at = NOW()
		WHERE id = $2 AND status IN ('pending', 'accepted')
	`
	_, err := r.db.Exec(query, reason, bookingID)
	return err
}

// GetAllByVendorIDWithCustomerDetails - ambil semua booking vendor beserta detail customer
// FIX N+1: menggunakan satu JOIN query alih-alih loop + per-booking query
// Sebelumnya: 1 + N query (GetByVendorID + GetWithCustomerDetails per booking)
// Sekarang: cukup 1 query
func (r *BookingRepository) GetAllByVendorIDWithCustomerDetails(vendorID string) ([]model.BookingWithCustomer, error) {
	query := `
		SELECT
			b.id, b.vendor_id, b.customer_id, u.name, u.email,
			b.service_date, b.service_time, b.address, b.notes,
			b.status, b.total_price, b.admin_fee, b.created_at, b.updated_at,
			COALESCE(up.phone, '') AS customer_phone
		FROM bookings b
		JOIN users u ON b.customer_id = u.id
		LEFT JOIN (
			SELECT user_id, phone FROM vendors
		) up ON up.user_id = u.id
		WHERE b.vendor_id = $1
		ORDER BY b.created_at DESC
	`
	rows, err := r.db.Query(query, vendorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []model.BookingWithCustomer
	for rows.Next() {
		var bwc model.BookingWithCustomer
		err := rows.Scan(
			&bwc.ID, &bwc.VendorID, &bwc.CustomerID, &bwc.CustomerName, &bwc.CustomerEmail,
			&bwc.ServiceDate, &bwc.ServiceTime, &bwc.Address, &bwc.Notes,
			&bwc.Status, &bwc.TotalPrice, &bwc.AdminFee, &bwc.CreatedAt, &bwc.UpdatedAt,
			&bwc.CustomerPhone,
		)
		if err != nil {
			return nil, err
		}
		result = append(result, bwc)
	}
	if result == nil {
		result = []model.BookingWithCustomer{}
	}
	return result, nil
}
