// components/modals/DetailPaymentModal.jsx
import { Modal, Card, Row, Col, Badge } from 'react-bootstrap';

const DetailPaymentModal = ({ isOpen, onClose, payment }) => {
    if (!payment) return null;

    // Function untuk payment status color
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
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID');
    };

    return (
        <Modal show={isOpen} onHide={onClose} size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
                <Modal.Title>
                    Payment Details - {payment.payment_code}
                    <Badge bg={getPaymentStatusColor(payment.payment_status)} className="ms-2">
                        {payment.payment_status?.replace(/_/g, ' ')}
                    </Badge>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    {/* Informasi Payment */}
                    <Col md={6}>
                        <Card className="mb-3">
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Payment Information</strong>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    <strong>Payment Code:</strong>
                                    <p className="h5 text-primary">{payment.payment_code}</p>
                                </div>

                                <div className="mb-2">
                                    <strong>Status:</strong>
                                    <p>
                                        <Badge bg={getPaymentStatusColor(payment.payment_status)} className="fs-6">
                                            {payment.payment_status?.replace(/_/g, ' ')}
                                        </Badge>
                                    </p>
                                </div>

                                <div className="mb-2">
                                    <strong>Payment Method:</strong>
                                    <p className="h6">{payment.payment_method?.replace(/_/g, ' ') || 'BANK_TRANSFER'}</p>
                                </div>

                                <div className="mb-2">
                                    <strong>Created At:</strong>
                                    <p>{formatDateTime(payment.createdAt)}</p>
                                </div>

                                {payment.expires_at && (
                                    <div className="mb-2">
                                        <strong>Expires At:</strong>
                                        <p>{formatDateTime(payment.expires_at)}</p>
                                    </div>
                                )}

                                {payment.paid_at && (
                                    <div className="mb-2">
                                        <strong>Paid At:</strong>
                                        <p>{formatDateTime(payment.paid_at)}</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Informasi Amount & Reservation */}
                    <Col md={6}>
                        <Card className="mb-3">
                            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                                <strong>Amount Details</strong>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <strong>Amount:</strong>
                                    <p className="h4 text-success">
                                        Rp.{(payment.amount || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {payment.amount_paid && (
                                    <div className="mb-3">
                                        <strong>Amount Paid:</strong>
                                        <p className="h5 text-success">
                                            Rp.{(payment.amount_paid || 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                )}

                                <hr />

                                <div className="mb-2">
                                    <strong>Reservation Code:</strong>
                                    <p className="h6">{payment.reservation?.reservation_code || '-'}</p>
                                </div>

                                <div className="mb-2">
                                    <strong>Guest Name:</strong>
                                    <p>{payment.reservation?.name || '-'}</p>
                                </div>

                                <div className="mb-2">
                                    <strong>Guest Email:</strong>
                                    <p>{payment.reservation?.email || '-'}</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Admin Notes (jika ada) */}
                {payment.admin_notes && (
                    <Card className="mb-3">
                        <Card.Header style={{ backgroundColor: '#fff3cd' }}>
                            <strong>Admin Notes</strong>
                        </Card.Header>
                        <Card.Body>
                            <p className="text-muted mb-0">{payment.admin_notes}</p>
                        </Card.Body>
                    </Card>
                )}

                {/* Total Summary */}
                <Card>
                    <Card.Header style={{ backgroundColor: '#d1ecf1' }}>
                        <strong>Total Summary</strong>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center">
                            <p className="h2 text-success mb-1">
                                Rp.{(payment.amount || 0).toLocaleString('id-ID')}
                            </p>
                            <small className="text-muted">
                                {payment.amount_paid ? 'Amount Paid' : 'Total Amount'}
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer>
                <button 
                    className="btn btn-secondary" 
                    onClick={onClose}
                >
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default DetailPaymentModal;