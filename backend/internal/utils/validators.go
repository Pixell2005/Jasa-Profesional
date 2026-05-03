package utils

import (
	"regexp"
	"time"
)

// ============================================================
// VALIDATORS - Utility untuk validasi input/data
// ============================================================

// IsValidEmail: Validasi format email
// Menggunakan simple regex pattern untuk validasi dasar
// Untuk validasi yang lebih ketat, bisa menggunakan library seperti govalidator
func IsValidEmail(email string) bool {
	// Simple email regex pattern
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	regex := regexp.MustCompile(pattern)
	return regex.MatchString(email)
}

// IsValidPassword: Validasi password strength
// Requirements:
// - Minimal 8 karakter
// - Harus mengandung minimal 1 huruf
// - Harus mengandung minimal 1 angka
func IsValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)

	return hasLetter && hasNumber
}

// IsValidPhoneNumber: Validasi format nomor telepon Indonesia
// Format yang diterima: +62xxx, 0xxx
func IsValidPhoneNumber(phone string) bool {
	// Simple phone validation - starts with +62 or 0
	pattern := `^(\+62|0)[0-9]{7,14}$`
	regex := regexp.MustCompile(pattern)
	return regex.MatchString(phone)
}

// IsValidUUID: Validasi format UUID v4
func IsValidUUID(uuid string) bool {
	pattern := `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
	regex := regexp.MustCompile(pattern)
	return regex.MatchString(uuid)
}

// IsValidDate: Validasi format tanggal dan tidak boleh di masa lalu
// Format: YYYY-MM-DD
// Return: (isValid, isInFuture)
func IsValidDate(dateStr string) (bool, bool) {
	// Parse date
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return false, false
	}

	// Check if date is not in the past
	today := time.Now().Truncate(24 * time.Hour)
	isFuture := date.After(today) || date.Equal(today)

	return true, isFuture
}

// IsValidTime: Validasi format waktu
// Format: HH:MM (24-hour format)
func IsValidTime(timeStr string) bool {
	_, err := time.Parse("15:04", timeStr)
	return err == nil
}

// IsValidPrice: Validasi harga (harus positif)
func IsValidPrice(price int) bool {
	return price > 0
}

// IsValidEta: Validasi ETA (harus positif, maksimal 24 jam)
func IsValidEta(eta int) bool {
	return eta > 0 && eta <= 24
}

// IsValidBookingStatus: Validasi booking status
// Possible values: pending, accepted, rejected, completed, cancelled, in_progress
func IsValidBookingStatus(status string) bool {
	validStatuses := map[string]bool{
		"pending":     true,
		"accepted":    true,
		"rejected":    true,
		"completed":   true,
		"cancelled":   true,
		"in_progress": true,
	}
	return validStatuses[status]
}

// IsValidUserRole: Validasi user role
// Possible values: customer, vendor, admin
func IsValidUserRole(role string) bool {
	validRoles := map[string]bool{
		"customer": true,
		"vendor":   true,
		"admin":    true,
	}
	return validRoles[role]
}

// IsValidCategory: Validasi kategori service
// Contoh valid categories: "cleaning", "maintenance", "services", "repair", dst
func IsValidCategory(category string) bool {
	// Hanya alphanumeric dan underscore/hyphen
	pattern := `^[a-z0-9_-]{2,30}$`
	regex := regexp.MustCompile(pattern)
	return regex.MatchString(category)
}

// IsEmptyString: Cek apakah string kosong atau hanya whitespace
func IsEmptyString(s string) bool {
	return len(s) == 0 || regexp.MustCompile(`^\s+$`).MatchString(s)
}

// IsValidName: Validasi nama (3-100 karakter)
func IsValidName(name string) bool {
	return len(name) >= 3 && len(name) <= 100
}

// IsValidBio: Validasi bio (max 500 karakter)
func IsValidBio(bio string) bool {
	if IsEmptyString(bio) {
		return true // Bio optional
	}
	return len(bio) <= 500
}

// IsValidTags: Validasi tags array
// Max 10 tags, setiap tag max 20 karakter
func IsValidTags(tags []string) bool {
	if len(tags) > 10 {
		return false
	}
	for _, tag := range tags {
		if len(tag) == 0 || len(tag) > 20 {
			return false
		}
	}
	return true
}

// ValidationErrors: Map untuk menyimpan validation errors
type ValidationErrors map[string]string

// AddError: Tambah validation error
func (ve ValidationErrors) AddError(field string, message string) {
	if ve == nil {
		ve = make(ValidationErrors)
	}
	ve[field] = message
}

// HasErrors: Cek apakah ada errors
func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}

// GetFirstError: Get error pertama (untuk response message)
func (ve ValidationErrors) GetFirstError() string {
	for _, msg := range ve {
		return msg
	}
	return "validation error"
}
