package service

import (
	"errors"
	"strings"
	"time"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/daniel/jasa-profesional/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// jwtClaims — alias ke model.JWTClaims yang sudah di-export
// Tidak perlu definisi ulang di sini, cukup pakai model.JWTClaims

type AuthService struct {
	userRepo       *repository.UserRepository
	jwtSecret      string
	jwtExpireHours int
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string, jwtExpireHours int) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		jwtSecret:      jwtSecret,
		jwtExpireHours: jwtExpireHours,
	}
}

func (s *AuthService) generateToken(user *model.User) (string, error) {
	claims := model.JWTClaims{
		UserId: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.jwtExpireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// Register - buat akun baru
func (s *AuthService) Register(req model.RegisterRequest) (*model.User, error) {
	// 1. Cek apakah email sudah dipakai
	existing, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("email sudah terdaftar")
	}

	// 2. Hash password menggunakan bcrypt
	// bcrypt.DefaultCost = 10 putaran hashing, cukup aman dan tidak terlalu lambat
	// Hasil: "$2a$10$..." - tidak bisa dibalik ke password asli
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 3. Simpan user baru ke database
	user := model.User{
		ID:       uuid.New().String(), // buat ID unik pakai UUID
		Email:    req.Email,
		Password: string(hashedPassword), // simpan hash-nya, bukan password asli
		Name:     req.Name,
		Role:     "customer", // default role untuk yang daftar lewat sini
	}

	// 4. Simpan ke database
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	// 5. Return data user (tanpa password)
	// Jangan kirim password ke frontend, walaupun sudah di-hash, tetap saja tidak perlu diketahui
	user.Password = "" // kosongkan field password sebelum return
	return &user, nil
}

func (s *AuthService) Login(req model.LoginRequest) (*model.LoginResponse, error) {
	// 1. Cari user berdasarkan email
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	// Gunakan error message yang sama untuk email tidak ditemukan dan password salah
	// agar tidak memberikan petunjuk ke penyerang
	if user == nil {
		return nil, errors.New("email atau password salah")
	}

	// 2. Bandingkan password yang dikirim dengan hash yang ada di database
	// bcrypt.CompareHashAndPassword secara otomatis menangani perbandingan yang aman
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		// Password tidak cocok
		return nil, errors.New("email atau password salah")
	}

	// 3. Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	// 4. Hapus password sebelum dikirim ke frontend
	user.Password = ""

	return &model.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

// LoginWithMetadata - login dengan tracking IP address
// Dipanggil dari handler, menerima IP address client
func (s *AuthService) LoginWithMetadata(req model.LoginRequest, clientIP string) (*model.LoginResponse, error) {
	// 1. Lakukan proses login normal terlebih dahulu
	resp, err := s.Login(req)
	if err != nil {
		return nil, err
	}

	// 2. Update login metadata di database
	// Ini akan update last_login_at, last_ip, dan increment login_count
	if err := s.userRepo.UpdateLoginMetadata(resp.User.ID, clientIP); err != nil {
		// Jika gagal update metadata, jangan fail login
		// Cukup log error saja (bisa ditambahkan logging nanti)
	}

	return resp, nil
}

// GetUserProfile - ambil profil lengkap user
func (s *AuthService) GetUserProfile(userID string) (*model.User, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user tidak ditemukan")
	}
	return user, nil
}

// UpdateProfile - update profil user
func (s *AuthService) UpdateProfile(userID string, name string, email string) (*model.User, error) {
	// 1. Validasi input
	if name == "" {
		return nil, errors.New("nama tidak boleh kosong")
	}
	if email == "" {
		return nil, errors.New("email tidak boleh kosong")
	}

	// 2. Cek apakah email baru sudah terdaftar (dan bukan email lama)
	existing, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID != userID {
		return nil, errors.New("email sudah terdaftar")
	}

	// 3. Update profile di database
	if err := s.userRepo.UpdateProfile(userID, name, email); err != nil {
		return nil, err
	}

	// 4. Ambil data user yang sudah ter-update
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// ChangePassword - ubah password user
// Memerlukan password lama untuk verifikasi
func (s *AuthService) ChangePassword(userID string, oldPassword string, newPassword string) error {
	// 1. Ambil user berdasarkan ID
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user tidak ditemukan")
	}

	// 2. Verifikasi password lama
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword))
	if err != nil {
		return errors.New("password lama tidak sesuai")
	}

	// 3. Hash password baru
	if len(newPassword) < 8 {
		return errors.New("password baru minimal 8 karakter")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 4. Update password di database
	if err := s.userRepo.UpdatePassword(userID, string(hashedPassword)); err != nil {
		return err
	}

	return nil
}

// Logout - proses logout (update last_logout_at)
func (s *AuthService) Logout(userID string) error {
	return s.userRepo.UpdateLogoutMetadata(userID)
}

// ForgotPassword - reset password berdasarkan email + verifikasi nama
// Memerlukan email DAN nama terdaftar agar lebih aman
func (s *AuthService) ForgotPassword(email string, name string, newPassword string) error {
	// 1. Cari user berdasarkan email
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return err
	}
	// Gunakan pesan generik agar tidak bocorkan info apakah email terdaftar
	if user == nil {
		return errors.New("email atau nama tidak sesuai")
	}

	// 2. Verifikasi nama — harus cocok dengan nama yang terdaftar (case-insensitive)
	registeredName := strings.ToLower(strings.TrimSpace(user.Name))
	inputName := strings.ToLower(strings.TrimSpace(name))
	if registeredName != inputName {
		// Pesan sengaja dibuat ambigu agar tidak bocorkan apakah email atau nama yang salah
		return errors.New("email atau nama tidak sesuai")
	}

	// 3. Validasi password baru
	if len(newPassword) < 8 {
		return errors.New("password baru minimal 8 karakter")
	}

	// 4. Hash password baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 5. Update password di database
	return s.userRepo.UpdatePassword(user.ID, string(hashedPassword))
}
