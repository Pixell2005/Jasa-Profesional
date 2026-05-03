package repository

import (
	"database/sql"
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
)

// ReviewRepository - repository untuk tabel reviews
// Mengelola CRUD review dari customer ke vendor setelah booking selesai
type ReviewRepository struct {
	db *sql.DB
}

func NewReviewRepository(db *sql.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

// Create - simpan review baru ke database
// Akan gagal jika booking_id sudah ada review (UNIQUE constraint)
func (r *ReviewRepository) Create(review model.Review) error {
	query := `
		INSERT INTO reviews (id, booking_id, vendor_id, customer_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(query,
		review.ID,
		review.BookingID,
		review.VendorID,
		review.CustomerID,
		review.Rating,
		review.Comment,
	)
	return err
}

// GetByBookingID - cek apakah booking sudah punya review
func (r *ReviewRepository) GetByBookingID(bookingID string) (*model.Review, error) {
	query := `
		SELECT id, booking_id, vendor_id, customer_id, rating, comment, created_at
		FROM reviews
		WHERE booking_id = $1
	`
	rev := &model.Review{}
	err := r.db.QueryRow(query, bookingID).Scan(
		&rev.ID, &rev.BookingID, &rev.VendorID, &rev.CustomerID,
		&rev.Rating, &rev.Comment, &rev.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // belum ada review untuk booking ini
		}
		return nil, err
	}
	return rev, nil
}

// GetByVendorID - ambil semua review untuk satu vendor
// Diurutkan dari yang terbaru
func (r *ReviewRepository) GetByVendorID(vendorID string) ([]model.Review, error) {
	query := `
		SELECT id, booking_id, vendor_id, customer_id, rating, comment, created_at
		FROM reviews
		WHERE vendor_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query, vendorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []model.Review
	for rows.Next() {
		var rev model.Review
		err := rows.Scan(
			&rev.ID, &rev.BookingID, &rev.VendorID, &rev.CustomerID,
			&rev.Rating, &rev.Comment, &rev.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, rev)
	}
	if reviews == nil {
		reviews = []model.Review{}
	}
	return reviews, nil
}
