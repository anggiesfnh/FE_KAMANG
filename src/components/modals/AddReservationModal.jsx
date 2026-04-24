import { Modal, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useState, useEffect } from "react";
import { reservationsAPI, accommodationsAPI } from '../../services/api';

const AddReservationModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        check_in: '',
        check_out: '',
        notes: '',
        guest_count: '',
        accommodation_ids: [],
        accommodation_qtys: {}
    });
    const [accommodations, setAccommodations] = useState([]);
    const [selectedAccommodations, setSelectedAccommodations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAccommodations();
            // Set default dates
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            setFormData(prev => ({
                ...prev,
                check_in: tomorrow.toISOString().split('T')[0],
                check_out: dayAfterTomorrow.toISOString().split('T')[0]
            }));
        }
    }, [isOpen]);

    const fetchAccommodations = async () => {
        try {
            const response = await accommodationsAPI.getAllAccommodations();
            setAccommodations(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch accommodations:', error);
            setError('Failed to load accommodations');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                accommodation_ids: selectedAccommodations.map(acc => acc.id),
                accommodation_qtys: selectedAccommodations.map(acc =>
                    formData.accommodation_qtys[acc.id] || 1
                ),
                guest_count: parseInt(formData.guest_count) || undefined
            };

            // Gunakan endpoint admin untuk create reservation
            await reservationsAPI.createReservationAsAdmin(submitData);
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to create reservation:", error);
            setError(error.response?.data?.message || "Failed to create reservation");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            check_in: '',
            check_out: '',
            notes: '',
            guest_count: '',
            accommodation_ids: [],
            accommodation_qtys: {}
        });
        setSelectedAccommodations([]);
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAccommodationSelect = (accommodation) => {
        if (selectedAccommodations.find(acc => acc.id === accommodation.id)) {
            // Remove if already selected
            setSelectedAccommodations(prev =>
                prev.filter(acc => acc.id !== accommodation.id)
            );
        } else {
            // Add to selection
            setSelectedAccommodations(prev => [...prev, accommodation]);
        }
    };

    const handleQuantityChange = (accommodationId, quantity) => {
        setFormData(prev => ({
            ...prev,
            accommodation_qtys: {
                ...prev.accommodation_qtys,
                [accommodationId]: parseInt(quantity) || 1
            }
        }));
    };

    const calculateTotal = () => {
        if (!formData.check_in || !formData.check_out) return 0;

        const checkIn = new Date(formData.check_in);
        const checkOut = new Date(formData.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        return selectedAccommodations.reduce((total, acc) => {
            const qty = formData.accommodation_qtys[acc.id] || 1;
            return total + (parseFloat(acc.price) * qty * nights);
        }, 0);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const availableAccommodations = accommodations.filter(acc =>
        acc.available_units > 0 &&
        !selectedAccommodations.find(selected => selected.id === acc.id)
    );

    const totalPrice = calculateTotal();

    return (
        <Modal show={isOpen} onHide={handleClose} size="xl">
            <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
                <Modal.Title>Add New Reservation</Modal.Title>
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
                    </div>

                    <div className="row">
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
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Guest Count (Optional)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="guest_count"
                                    value={formData.guest_count}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Auto-calculated from accommodations"
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

                    {/* Accommodation Selection */}
                    <Form.Group className="mb-3">
                        <Form.Label>Select Accommodations</Form.Label>
                        <div className="border rounded p-3">
                            <div className="row">
                                {/* Available Accommodations */}
                                <div className="col-md-6">
                                    <h6>Available Accommodations</h6>
                                    {availableAccommodations
                                        .filter(acc => acc.available_units > 0)
                                        .map(acc => (
                                            <div key={acc.id} className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`acc-${acc.id}`}
                                                    onChange={() => handleAccommodationSelect(acc)}
                                                    disabled={acc.available_units === 0} // ← DISABLE YANG UNAVAILABLE
                                                />
                                                <label className="form-check-label" htmlFor={`acc-${acc.id}`}>
                                                    <strong>{acc.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {acc.property_type?.name} •
                                                        Capacity: {acc.capacity} •
                                                        Available: {acc.available_units} •
                                                        Rp.{acc.price?.toLocaleString('id-ID')}/night
                                                    </small>
                                                </label>
                                            </div>
                                        ))}
                                    {availableAccommodations.length === 0 && (
                                        <p className="text-muted">No available accommodations</p>
                                    )}
                                </div>

                                {/* Selected Accommodations */}
                                <div className="col-md-6">
                                    <h6>Selected Accommodations</h6>
                                    {selectedAccommodations.map(acc => (
                                        <div key={acc.id} className="border rounded p-3 mb-2 bg-light">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <strong>{acc.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {acc.property_type?.name} •
                                                        Capacity: {acc.capacity} •
                                                        Rp.{acc.price?.toLocaleString('id-ID')}/night
                                                    </small>
                                                </div>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleAccommodationSelect(acc)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Form.Label className="me-2 mb-0">Quantity:</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    style={{ width: '80px' }}
                                                    min="1"
                                                    max={acc.available_units}
                                                    value={formData.accommodation_qtys[acc.id] || 1}
                                                    onChange={(e) => handleQuantityChange(acc.id, e.target.value)}
                                                />
                                                <small className="text-muted ms-2">
                                                    Max: {acc.available_units}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedAccommodations.length === 0 && (
                                        <p className="text-muted">No accommodations selected</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Form.Group>

                    {/* Total Price Display */}
                    {selectedAccommodations.length > 0 && formData.check_in && formData.check_out && (
                        <Form.Group className="mb-3">
                            <Form.Label>Total Estimate</Form.Label>
                            <div className="border rounded p-3 bg-light">
                                <div className="text-center">
                                    <p className="h3 text-success mb-0">
                                        Rp.{totalPrice.toLocaleString('id-ID')}
                                    </p>
                                    <small className="text-muted">
                                        Estimated total for {
                                            Math.ceil((new Date(formData.check_out) - new Date(formData.check_in)) / (1000 * 60 * 60 * 24))
                                        } nights
                                    </small>
                                </div>
                            </div>
                        </Form.Group>
                    )}

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
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        style={{ backgroundColor: '#4a7856', borderColor: '#4a7856' }}
                        disabled={loading || selectedAccommodations.length === 0}
                    >
                        {loading ? 'Creating...' : 'Create Reservation'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddReservationModal;