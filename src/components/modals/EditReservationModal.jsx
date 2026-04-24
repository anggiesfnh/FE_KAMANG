import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useEffect, useState } from "react";
import { reservationsAPI } from '../../services/api';

const EditReservationModal = ({ isOpen, onClose, reservation, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    notes: '',
    status: '',
    payment_status: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation && reservation.id) {
      const latestPayment = reservation.payments && reservation.payments[0];
      setFormData({
        name: reservation.name || '',
        email: reservation.email || '',
        phone: reservation.phone || '',
        check_in: reservation.check_in ? reservation.check_in.split('T')[0] : '',
        check_out: reservation.check_out ? reservation.check_out.split('T')[0] : '',
        notes: reservation.notes || '',
        status: reservation.status || 'PENDING',
        payment_status: latestPayment?.payment_status || 'PENDING'
      });
      setError('');
    }
  }, [reservation]);

  // Di EditReservationModal.jsx - perbaiki handleSubmit untuk payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!reservation?.id) {
      setError('Reservation ID tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      // Update reservation data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        check_in: new Date(formData.check_in).toISOString(),
        check_out: new Date(formData.check_out).toISOString(),
        notes: formData.notes,
        status: formData.status
      };

      const response = await reservationsAPI.updateReservation(reservation.id, updateData);

      // Update payment status if changed and payment exists
      if (formData.payment_status && reservation.payments && reservation.payments[0]) {
        try {
          // Gunakan endpoint updatePaymentStatus dengan reservation ID
          await reservationsAPI.updatePaymentStatus(reservation.id, {
            payment_status: formData.payment_status
          });
        } catch (paymentError) {
          console.error('Error updating payment:', paymentError);
          // Jangan gagalkan seluruh proses jika payment update gagal
        }
      }

      if (onUpdate && typeof onUpdate === 'function') {
        onUpdate();
      }
      onClose();

    } catch (error) {
      console.error('Error updating reservation:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!reservation) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
        <Modal.Title>Edit Reservation - {reservation?.reservation_code}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Guest Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Check-in Date</Form.Label>
                <Form.Control
                  type="date"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Check-out Date</Form.Label>
                <Form.Control
                  type="date"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or special requests"
            />
          </Form.Group>

          {/* Display accommodations (read-only) */}
          {reservation.accommodations && reservation.accommodations.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Accommodations (Read Only)</Form.Label>
              <div className="border rounded p-3 bg-light">
                {reservation.accommodations.map((accRes, index) => (
                  <div key={index} className="mb-2">
                    <strong>{accRes.qty}x {accRes.accommodation?.name}</strong>
                    <br />
                    <small className="text-muted">
                      {accRes.accommodation?.property_type?.name} •
                      Rp.{accRes.price_at_booking?.toLocaleString('id-ID')}/night
                    </small>
                  </div>
                ))}
              </div>
            </Form.Group>
          )}

          {/* Display payment info (read-only) */}
          {reservation.payments && reservation.payments.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Payment Information (Read Only)</Form.Label>
              <div className="border rounded p-3 bg-light">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Total Amount:</strong>
                    <p className="text-success h5">
                      Rp.{(reservation.price_total || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <strong>Payment Status:</strong>
                    <p>
                      <span className={`badge bg-${reservation.payments[0].payment_status === 'PAID' ? 'success' : 'warning'}`}>
                        {reservation.payments[0].payment_status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Form.Group>
          )}

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Reservation Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                >
                  <option value="PENDING">Pending</option>
                  <option value="WAITING_VERIFICATION">Waiting Verification</option>
                  <option value="PAID">Paid</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            style={{ backgroundColor: '#4a7856', borderColor: '#4a7856' }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Reservation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditReservationModal;