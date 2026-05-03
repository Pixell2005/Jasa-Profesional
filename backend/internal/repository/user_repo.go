package repository

import (
	"database/sql"
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create - menyimpan user baru ke database
// Memakai $1, $2, ... bukan string langsung, untuk parameter query agar aman dari SQL injection
func (r *UserRepository) Create(user model.User) error {
	query := `
		INSERT INTO users (id, email, password, name, role)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(query, user.ID, user.Email, user.Password, user.Name, user.Role)
	return err
}

// FindByEmail - mencari user berdasarkan email
// Dipakai saat login untuk verifikasi email dan password
// Filter: is_active = true DAN deleted_at IS NULL (soft-deleted user tidak bisa login)
func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, email, password, name, role, is_active, created_at,
		       updated_at, last_login_at, last_logout_at, login_count, last_ip
		FROM users
		WHERE email = $1
		  AND is_active = true
		  AND deleted_at IS NULL
	`
	user := &model.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password, // ini hash-nya, bukan password asli
		&user.Name,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLoginAt,
		&user.LastLogoutAt,
		&user.LoginCount,
		&user.LastIP,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // user tidak ditemukan, return nill (bukan error)

		}
		return nil, err // error database sungguhan
	}
	return user, nil
}

// FindByID - mencari user berdasarkan ID
// Dipakai di endpoint /auth/me
// Filter: is_active = true DAN deleted_at IS NULL
func (r *UserRepository) FindByID(id string) (*model.User, error) {
	query := `	
		SELECT id, email, name, role, is_active, created_at,
		       updated_at, last_login_at, last_logout_at, login_count, last_ip
		FROM users
		WHERE id = $1
		  AND is_active = true
		  AND deleted_at IS NULL
	`
	user := &model.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLoginAt,
		&user.LastLogoutAt,
		&user.LoginCount,
		&user.LastIP,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // user tidak ditemukan, return nill (bukan error)
		}
		return nil, err
	}
	return user, nil
}

// UpdateRole - update role user dengan validasi role yang diperbolehkan
// Hanya menerima: "customer", "vendor", "admin"
func (r *UserRepository) UpdateRole(id string, role string) error {
	// Guard: pastikan role yang di-set adalah nilai yang valid
	validRoles := map[string]bool{"customer": true, "vendor": true, "admin": true}
	if !validRoles[role] {
		return errors.New("invalid role: hanya customer/vendor/admin yang diizinkan")
	}
	query := `
		UPDATE users
		SET role = $1
		WHERE id = $2
	`
	_, err := r.db.Exec(query, role, id)
	return err
}

// GetAll - ambil semua user
func (r *UserRepository) GetAll() ([]model.User, error) {
	query := `
		SELECT id, email, name, role, is_active, created_at, updated_at,
		       last_login_at, last_logout_at, login_count, last_ip
		FROM users
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var u model.User
		err := rows.Scan(
			&u.ID,
			&u.Email,
			&u.Name,
			&u.Role,
			&u.IsActive,
			&u.CreatedAt,
			&u.UpdatedAt,
			&u.LastLoginAt,
			&u.LastLogoutAt,
			&u.LoginCount,
			&u.LastIP,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// UpdateLoginMetadata - update metadata login user (last login, IP, login count)
// Dipanggil setiap user berhasil login
func (r *UserRepository) UpdateLoginMetadata(userID string, ip string) error {
	query := `
		UPDATE users
		SET last_login_at = NOW(),
		    last_ip = $1,
		    login_count = login_count + 1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, ip, userID)
	return err
}

// UpdateLogoutMetadata - update metadata logout user
func (r *UserRepository) UpdateLogoutMetadata(userID string) error {
	query := `
		UPDATE users
		SET last_logout_at = NOW(),
		    updated_at = NOW()
		WHERE id = $1
	`
	_, err := r.db.Exec(query, userID)
	return err
}

// UpdateProfile - update profil user (name, email)
func (r *UserRepository) UpdateProfile(userID string, name string, email string) error {
	query := `
		UPDATE users
		SET name = $1,
		    email = $2,
		    updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.Exec(query, name, email, userID)
	return err
}

// UpdatePassword - update password user
func (r *UserRepository) UpdatePassword(userID string, hashedPassword string) error {
	query := `
		UPDATE users
		SET password = $1,
		    updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(query, hashedPassword, userID)
	return err
}

// DeactivateUser - soft delete user (set is_active = false)
func (r *UserRepository) DeactivateUser(userID string) error {
	query := `
		UPDATE users
		SET is_active = false,
		    updated_at = NOW()
		WHERE id = $1
	`
	_, err := r.db.Exec(query, userID)
	return err
}

// ActivateUser - activate kembali user
func (r *UserRepository) ActivateUser(userID string) error {
	query := `
		UPDATE users
		SET is_active = true,
		    updated_at = NOW()
		WHERE id = $1
	`
	_, err := r.db.Exec(query, userID)
	return err
}

// CountByRole - hitung jumlah user berdasarkan role
func (r *UserRepository) CountByRole(role string) (int, error) {
	query := `
		SELECT COUNT(*) FROM users
		WHERE role = $1 AND is_active = true
	`
	var count int
	err := r.db.QueryRow(query, role).Scan(&count)
	return count, err
}

// CountAll - hitung total user aktif
func (r *UserRepository) CountAll() (int, error) {
	query := `SELECT COUNT(*) FROM users WHERE is_active = true`
	var count int
	err := r.db.QueryRow(query).Scan(&count)
	return count, err
}

// CheckEmailExists - cek apakah email sudah terdaftar
func (r *UserRepository) CheckEmailExists(email string) (bool, error) {
	query := `SELECT COUNT(*) FROM users WHERE email = $1`
	var count int
	err := r.db.QueryRow(query, email).Scan(&count)
	return count > 0, err
}
