package utils

import (
	"errors"
	"net/http"

	"github.com/daniel/jasa-profesional/internal/model"
	"github.com/gin-gonic/gin"
)

// ============================================================
// ERROR HANDLING & HTTP RESPONSE UTILITIES
// ============================================================

// Custom error types untuk kategorisasi
type ErrorType string

const (
	ErrorValidation   ErrorType = "VALIDATION_ERROR"
	ErrorNotFound     ErrorType = "NOT_FOUND"
	ErrorUnauthorized ErrorType = "UNAUTHORIZED"
	ErrorForbidden    ErrorType = "FORBIDDEN"
	ErrorConflict     ErrorType = "CONFLICT"
	ErrorInternal     ErrorType = "INTERNAL_ERROR"
	ErrorBadRequest   ErrorType = "BAD_REQUEST"
)

// CustomError: Struktur error dengan tipe dan pesan terstruktur
type CustomError struct {
	Type    ErrorType
	Message string
	Status  int
}

// Error implements error interface
func (e *CustomError) Error() string {
	return e.Message
}

// NewValidationError: Error untuk validation gagal (400)
func NewValidationError(message string) *CustomError {
	return &CustomError{
		Type:    ErrorValidation,
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

// NewNotFoundError: Error untuk resource tidak ditemukan (404)
func NewNotFoundError(resource string) *CustomError {
	return &CustomError{
		Type:    ErrorNotFound,
		Message: resource + " tidak ditemukan",
		Status:  http.StatusNotFound,
	}
}

// NewUnauthorizedError: Error untuk authentication gagal (401)
func NewUnauthorizedError(message string) *CustomError {
	if message == "" {
		message = "unauthorized"
	}
	return &CustomError{
		Type:    ErrorUnauthorized,
		Message: message,
		Status:  http.StatusUnauthorized,
	}
}

// NewForbiddenError: Error untuk akses ditolak (403)
func NewForbiddenError(message string) *CustomError {
	if message == "" {
		message = "akses ditolak"
	}
	return &CustomError{
		Type:    ErrorForbidden,
		Message: message,
		Status:  http.StatusForbidden,
	}
}

// NewConflictError: Error untuk conflict/duplicate (409)
func NewConflictError(message string) *CustomError {
	if message == "" {
		message = "data sudah ada"
	}
	return &CustomError{
		Type:    ErrorConflict,
		Message: message,
		Status:  http.StatusConflict,
	}
}

// NewInternalError: Error untuk internal server error (500)
func NewInternalError(message string) *CustomError {
	if message == "" {
		message = "terjadi kesalahan pada server"
	}
	return &CustomError{
		Type:    ErrorInternal,
		Message: message,
		Status:  http.StatusInternalServerError,
	}
}

// NewBadRequestError: Error untuk bad request (400)
func NewBadRequestError(message string) *CustomError {
	if message == "" {
		message = "request tidak valid"
	}
	return &CustomError{
		Type:    ErrorBadRequest,
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

// RespondError: Mengirim error response ke client
func RespondError(c *gin.Context, err error) {
	var customErr *CustomError

	// Type assertion untuk CustomError
	if !errors.As(err, &customErr) {
		// Jika bukan CustomError, treat sebagai internal error
		customErr = NewInternalError("terjadi kesalahan pada server")
	}

	c.JSON(customErr.Status, model.Response{
		Success: false,
		Message: customErr.Message,
	})
}

// RespondSuccess: Mengirim success response ke client
func RespondSuccess(c *gin.Context, statusCode int, message string, data interface{}) {
	response := model.Response{
		Success: true,
		Message: message,
		Data:    data,
	}

	// Jika data adalah nil atau empty slice, jangan include di response
	if data == nil {
		response.Data = nil
	}

	c.JSON(statusCode, response)
}

// RespondSuccessCreated: Helper untuk response 201 Created
func RespondSuccessCreated(c *gin.Context, message string, data interface{}) {
	RespondSuccess(c, http.StatusCreated, message, data)
}

// RespondSuccessOK: Helper untuk response 200 OK
func RespondSuccessOK(c *gin.Context, message string, data interface{}) {
	RespondSuccess(c, http.StatusOK, message, data)
}

// RespondSuccessNoContent: Helper untuk response 204 No Content
func RespondSuccessNoContent(c *gin.Context) {
	c.JSON(http.StatusNoContent, nil)
}
