package repository

import (
	"database/sql"
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/lib/pq"
)

type VendorRepository struct {
	db *sql.DB
}

func NewVendorRepository(db *sql.DB) *VendorRepository {
	return &VendorRepository{db: db}
}

// GetAll - ambil semua vendor, bisa difilter berdasarkan kategori
func (r *VendorRepository) GetAll(category string) ([]model.Vendor, error) {
	var query string
	var rows *sql.Rows
	var err error

	if category != "" {
		// Filter berdasarkan kategori
		query = `
			SELECT id, name, role, category, tags, rating, review_count,
				   price, eta_hours, is_available, created_at
			FROM vendors
			WHERE category = $1 AND is_available = true
			ORDER BY rating DESC
			`
		rows, err = r.db.Query(query, category)
	} else {
		// Ambil semua vendor tanpa filter
		query = `
			SELECT id, name, role, category, tags, rating, review_count,
				   price, eta_hours, is_available, created_at
			FROM vendors
			WHERE is_available = true
			ORDER BY rating DESC
			`
		rows, err = r.db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close() // Tutup rows setelah selesai

	var vendors []model.Vendor
	for rows.Next() {
		var v model.Vendor
		err := rows.Scan(
			&v.ID,
			&v.Name,
			&v.Role,
			&v.Category,
			pq.Array(&v.Tags), // pq.Array untuk scan array PostgreSQL ke slice Go
			&v.Rating,
			&v.ReviewCount,
			&v.Price,
			&v.EtaHours,
			&v.IsAvailable,
			&v.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		vendors = append(vendors, v)
	}
	return vendors, nil
}

// GetByID - ambil vendor berdasarkan ID
func (r *VendorRepository) GetByID(id string) (*model.Vendor, error) {
	query := `
		SELECT id, user_id, name, role, category, tags, bio, phone, rating, review_count,
			   price, eta_hours, is_available, created_at
		FROM vendors
		WHERE id = $1
	`
	v := &model.Vendor{}
	err := r.db.QueryRow(query, id).Scan(
		&v.ID,
		&v.UserID,
		&v.Name,
		&v.Role,
		&v.Category,
		pq.Array(&v.Tags),
		&v.Bio,
		&v.Phone,
		&v.Rating,
		&v.ReviewCount,
		&v.Price,
		&v.EtaHours,
		&v.IsAvailable,
		&v.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // vendor tidak ditemukan
		}
		return nil, err
	}
	return v, nil
}

// FindByUserID - cari vendor berdasarkan user ID
func (r *VendorRepository) FindByUserID(userID string) (*model.Vendor, error) {
	query := `
		SELECT id, user_id, name, role, category, tags, bio, phone, rating, review_count,
			   price, eta_hours, is_available, created_at
		FROM vendors
		WHERE user_id = $1
	`
	v := &model.Vendor{}
	err := r.db.QueryRow(query, userID).Scan(
		&v.ID,
		&v.UserID,
		&v.Name,
		&v.Role,
		&v.Category,
		pq.Array(&v.Tags),
		&v.Bio,
		&v.Phone,
		&v.Rating,
		&v.ReviewCount,
		&v.Price,
		&v.EtaHours,
		&v.IsAvailable,
		&v.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return v, nil
}

// Create - menyimpan vendor baru
func (r *VendorRepository) Create(vendor model.Vendor) error {
	query := `
		INSERT INTO vendors (id, user_id, name, role, category, tags, bio, phone, price, eta_hours)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(query,
		vendor.ID,
		vendor.UserID,
		vendor.Name,
		vendor.Role,
		vendor.Category,
		pq.Array(vendor.Tags),
		vendor.Bio,
		vendor.Phone,
		vendor.Price,
		vendor.EtaHours,
	)
	return err
}

// UpdateProfile - update profil vendor
func (r *VendorRepository) UpdateProfile(vendorID string, name string, bio string, phone string, price int, etaHours int) error {
	query := `
		UPDATE vendors
		SET name = $1,
		    bio = $2,
		    phone = $3,
		    price = $4,
		    eta_hours = $5,
		    updated_at = NOW()
		WHERE id = $6
	`
	_, err := r.db.Exec(query, name, bio, phone, price, etaHours, vendorID)
	return err
}

// UpdateTags - update tags vendor
func (r *VendorRepository) UpdateTags(vendorID string, tags []string) error {
	query := `
		UPDATE vendors
		SET tags = $1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, pq.Array(tags), vendorID)
	return err
}

// UpdateAvailability - update status ketersediaan vendor
func (r *VendorRepository) UpdateAvailability(vendorID string, isAvailable bool) error {
	query := `
		UPDATE vendors
		SET is_available = $1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, isAvailable, vendorID)
	return err
}

// UpdateRating - update rating vendor (dipanggil ketika ada review baru)
// Formula: (current_rating * review_count + new_rating) / (review_count + 1)
func (r *VendorRepository) UpdateRating(vendorID string, newRating float64) error {
	query := `
		UPDATE vendors
		SET rating = (rating * review_count + $1) / (review_count + 1),
		    review_count = review_count + 1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, newRating, vendorID)
	return err
}

// CountAll - hitung total vendor aktif
func (r *VendorRepository) CountAll() (int, error) {
	query := `SELECT COUNT(*) FROM vendors WHERE is_available = true`
	var count int
	err := r.db.QueryRow(query).Scan(&count)
	return count, err
}

// CountByCategory - hitung vendor berdasarkan kategori
func (r *VendorRepository) CountByCategory(category string) (int, error) {
	query := `SELECT COUNT(*) FROM vendors WHERE category = $1 AND is_available = true`
	var count int
	err := r.db.QueryRow(query, category).Scan(&count)
	return count, err
}

// GetAllCategories - ambil list unik kategori vendor
func (r *VendorRepository) GetAllCategories() ([]string, error) {
	query := `
		SELECT DISTINCT category FROM vendors
		WHERE is_available = true
		ORDER BY category ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

// GetTopRatedVendors - ambil vendor dengan rating tertinggi (untuk featured list)
// Limit diambil dari parameter
func (r *VendorRepository) GetTopRatedVendors(limit int) ([]model.Vendor, error) {
	query := `
		SELECT id, user_id, name, role, category, tags, bio, phone, rating, review_count,
		       price, eta_hours, is_available, created_at
		FROM vendors
		WHERE is_available = true AND review_count > 0
		ORDER BY rating DESC, review_count DESC
		LIMIT $1
	`
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vendors []model.Vendor
	for rows.Next() {
		var v model.Vendor
		err := rows.Scan(
			&v.ID,
			&v.UserID,
			&v.Name,
			&v.Role,
			&v.Category,
			pq.Array(&v.Tags),
			&v.Bio,
			&v.Phone,
			&v.Rating,
			&v.ReviewCount,
			&v.Price,
			&v.EtaHours,
			&v.IsAvailable,
			&v.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		vendors = append(vendors, v)
	}
	return vendors, nil
}
