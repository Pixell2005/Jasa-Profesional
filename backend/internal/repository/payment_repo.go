package repository

import (
	"database/sql"
	"errors"

	"github.com/daniel/jasa-profesional/internal/model"
)

// PaymentRepository - repository untuk tabel payments
// Mengelola record pembayaran untuk setiap booking
type PaymentRepository struct {
	db *sql.DB
}

func NewPaymentRepository(db *sql.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// Create - simpan payment record baru
func (r *PaymentRepository) Create(payment model.Payment) error {
	query := `
		INSERT INTO payments (id, booking_id, customer_id, amount, payment_method, status, transaction_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(query,
		payment.ID,
		payment.BookingID,
		payment.CustomerID,
		payment.Amount,
		payment.PaymentMethod,
		payment.Status,
		payment.TransactionID,
	)
	return err
}

// GetByBookingID - ambil payment berdasarkan booking ID
func (r *PaymentRepository) GetByBookingID(bookingID string) (*model.Payment, error) {
	query := `
		SELECT id, booking_id, customer_id, amount, payment_method, status,
		       COALESCE(transaction_id, '') AS transaction_id, paid_at, created_at, updated_at
		FROM payments
		WHERE booking_id = $1
	`
	p := &model.Payment{}
	err := r.db.QueryRow(query, bookingID).Scan(
		&p.ID, &p.BookingID, &p.CustomerID, &p.Amount, &p.PaymentMethod, &p.Status,
		&p.TransactionID, &p.PaidAt, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // belum ada payment untuk booking ini
		}
		return nil, err
	}
	return p, nil
}

// UpdateStatus - update status payment
// Possible values: "pending", "paid", "failed", "refunded"
func (r *PaymentRepository) UpdateStatus(paymentID string, status string, transactionID string) error {
	query := `
		UPDATE payments
		SET status = $1,
		    transaction_id = NULLIF($2, ''),
		    paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
		    updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.Exec(query, status, transactionID, paymentID)
	return err
}
