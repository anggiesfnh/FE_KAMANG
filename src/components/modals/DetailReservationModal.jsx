import { useState } from 'react';
import { reservationsAPI } from '../../services/api';
import { Modal, Button, Badge, Row, Col, Card } from 'react-bootstrap';

const DetailReservationModal = ({ isOpen, onClose, reservation, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStatusUpdate = async (newStatus) => {
        if (!reservation?.id) return;
        
        setLoading(true);
        setError('');
        try {
            await reservationsAPI.updateReservationStatus(reservation.id, { status: newStatus });
            if (onUpdate && typeof onUpdate === 'function') {
                onUpdate(); // Refresh data
            }
            onClose(); // Tutup modal
        } catch (error) {
            console.error('Error updating status:', error);
            setError(error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    // Function untuk cancel reservation
    const handleCancel = async () => {
        if (!reservation?.id) return;
        
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        
        setLoading(true);
        setError('');
        try {
            await reservationsAPI.cancelReservation(reservation.id);
            if (onUpdate && typeof onUpdate === 'function') {
                onUpdate(); // Refresh data
            }
            onClose(); // Tutup modal
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            setError(error.response?.data?.message || 'Failed to cancel reservation');
        } finally {
            setLoading(false);
        }
    };

    if (!reservation) return null;

    // Function untuk menentukan badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'CHECKED_IN': return 'info';
            case 'CHECKED_OUT': return 'primary';
            case 'CANCELLED': return 'danger';
            case 'EXPIRED': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'WAITING_VERIFICATION': return 'info';
            case 'EXPIRED': return 'danger';
            case 'CANCELLED': return 'secondary';
            default: return 'secondary';
        }
    };

    // Format tanggal
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID');
    };

    // Hitung jumlah malam
    const calculateNights = (checkIn, checkOut) => {
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / msPerDay);
        return Math.max(1, nights);
    };

    const nights = calculateNights(reservation.check_in, reservation.check_out);
    const latestPayment = reservation.payments && reservation.payments.length > 0
        ? reservation.payments[0]
        : null;

    return (
        <Modal show={isOpen} onHide={onClose} size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
                <Modal.Title>
                    Reservation Details - {reservation.reservation_code}
                    <Badge bg={getStatusColor(reservation.status)} className="ms-2">
                        {reservation.status?.replace('_', ' ')}
                    </Badge>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    {/* Kolom Kiri - Informasi Reservasi */}
                    <Col md={6}>
                        <Card className="mb-3">
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Reservation Information</strong>
                            </Card.Header>
                            <Card.Body>
                                <Row className="mb-2">
                                    <Col sm={6}>
                                        <strong>Reservation Code:</strong>
                                        <p className="h5">{reservation.reservation_code}</p>
                                    </Col>
                                    <Col sm={6}>
                                        <strong>Status:</strong>
                                        <p>
                                            <Badge bg={getStatusColor(reservation.status)} className="fs-6">
                                                {reservation.status?.replace('_', ' ')}
                                            </Badge>
                                        </p>
                                    </Col>
                                </Row>

                                <Row className="mb-2">
                                    <Col sm={6}>
                                        <strong>Check-in:</strong>
                                        <p>{formatDate(reservation.check_in)}</p>
                                    </Col>
                                    <Col sm={6}>
                                        <strong>Check-out:</strong>
                                        <p>{formatDate(reservation.check_out)}</p>
                                    </Col>
                                </Row>

                                <div className="mb-2">
                                    <strong>Duration:</strong>
                                    <p className="h5">{nights} {nights === 1 ? 'Night' : 'Nights'}</p>
                                </div>

                                <div className="mb-2">
                                    <strong>Created At:</strong>
                                    <p>{formatDateTime(reservation.createdAt)}</p>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="mb-3">
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Guest Information</strong>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    <strong>Name:</strong>
                                    <p className="h5">{reservation.name}</p>
                                </div>
                                <div className="mb-2">
                                    <strong>Email:</strong>
                                    <p>{reservation.email}</p>
                                </div>
                                <div className="mb-2">
                                    <strong>Phone:</strong>
                                    <p>{reservation.phone}</p>
                                </div>
                                {reservation.user && (
                                    <div className="mb-2">
                                        <strong>Registered User:</strong>
                                        <p>Yes ({reservation.user.name})</p>
                                    </div>
                                )}
                                {reservation.notes && (
                                    <div className="mb-2">
                                        <strong>Notes:</strong>
                                        <p className="text-muted">{reservation.notes}</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Kolom Kanan - Akomodasi & Pembayaran */}
                    <Col md={6}>
                        <Card className="mb-3">
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Accommodations</strong>
                            </Card.Header>
                            <Card.Body>
                                {reservation.accommodations && reservation.accommodations.map((accRes, index) => (
                                    <div key={index} className="mb-3 p-3 border rounded">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>{accRes.accommodation?.name}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {accRes.accommodation?.property_type?.name}
                                                </small>
                                            </div>
                                            <Badge bg="info">{accRes.qty}x</Badge>
                                        </div>
                                        <div className="mt-2">
                                            <small>
                                                <strong>Price:</strong> Rp.{accRes.price_at_booking?.toLocaleString('id-ID')}/night
                                                <br />
                                                <strong>Subtotal:</strong> Rp.{accRes.total?.toLocaleString('id-ID')}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>

                        {latestPayment && (
                            <Card className="mb-3">
                                <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                    <strong>Payment Information</strong>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="mb-2">
                                        <Col sm={6}>
                                            <strong>Payment Code:</strong>
                                            <p>{latestPayment.payment_code}</p>
                                        </Col>
                                        <Col sm={6}>
                                            <strong>Status:</strong>
                                            <p>
                                                <Badge bg={getPaymentStatusColor(latestPayment.payment_status)}>
                                                    {latestPayment.payment_status?.replace('_', ' ')}
                                                </Badge>
                                            </p>
                                        </Col>
                                    </Row>

                                    <div className="mb-2">
                                        <strong>Total Amount:</strong>
                                        <p className="h4 text-success">
                                            Rp.{(latestPayment.amount || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>

                                    {latestPayment.amount_paid && (
                                        <div className="mb-2">
                                            <strong>Amount Paid:</strong>
                                            <p className="h5 text-success">
                                                Rp.{(latestPayment.amount_paid || 0).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-2">
                                        <strong>Payment Method:</strong>
                                        <p>{latestPayment.payment_method?.replace('_', ' ')}</p>
                                    </div>

                                    {latestPayment.expires_at && (
                                        <div className="mb-2">
                                            <strong>Expires At:</strong>
                                            <p>{formatDateTime(latestPayment.expires_at)}</p>
                                        </div>
                                    )}

                                    {latestPayment.paid_at && (
                                        <div className="mb-2">
                                            <strong>Paid At:</strong>
                                            <p>{formatDateTime(latestPayment.paid_at)}</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        )}

                        <Card>
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Total Summary</strong>
                            </Card.Header>
                            <Card.Body>
                                <div className="text-center">
                                    <p className="h2 text-success mb-0">
                                        Rp.{(reservation.price_total || 0).toLocaleString('id-ID')}
                                    </p>
                                    <small className="text-muted">Total for {nights} {nights === 1 ? 'night' : 'nights'}</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <div className="me-auto">
                    {/* Admin Actions */}
                    {reservation.status === 'PENDING' && (
                        <>
                            <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                disabled={loading}
                                className="me-2"
                            >
                                Confirm
                            </Button>
                            <Button 
                                variant="warning" 
                                size="sm"
                                onClick={() => handleStatusUpdate('EXPIRED')}
                                disabled={loading}
                                className="me-2"
                            >
                                Mark Expired
                            </Button>
                        </>
                    )}
                    {reservation.status === 'CONFIRMED' && (
                        <Button 
                            variant="info" 
                            size="sm"
                            onClick={() => handleStatusUpdate('CHECKED_IN')}
                            disabled={loading}
                            className="me-2"
                        >
                            Check In
                        </Button>
                    )}
                    {reservation.status === 'CHECKED_IN' && (
                        <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleStatusUpdate('CHECKED_OUT')}
                            disabled={loading}
                            className="me-2"
                        >
                            Check Out
                        </Button>
                    )}
                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );

};

export default DetailReservationModal;