import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { accommodationsAPI } from '../../services/api';

const AddAccommodationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    property_type_id: "",
    name: "",
    available_units: "",
    price: "",
    description: "",
    amenities: "",
    view: "",
    capacity: "",
    size: "",
    bed_type: ""
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPropertyTypes();
    }
  }, [isOpen]);

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch('http://kamangresort.pblweb0202.cloud:5000/api/property-types');
      const data = await response.json();
      setPropertyTypes(data.data || []);
    } catch (error) {
      console.error('Failed to fetch property types:', error);
      setError('Failed to load property types');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        available_units: parseInt(formData.available_units) || 0,
        price: parseFloat(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 1,
        size: parseInt(formData.size) || 0
      };

      await accommodationsAPI.createAccommodation(submitData);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to create accommodation:", error);
      setError(error.response?.data?.message || "Failed to create accommodation");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      property_type_id: "",
      name: "",
      available_units: "",
      price: "",
      description: "",
      amenities: "",
      view: "",
      capacity: "",
      size: "",
      bed_type: ""
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
        <Modal.Title>Add New Accommodation</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Accommodation Name</Form.Label>
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
                <Form.Label>Property Type</Form.Label>
                <Form.Select
                  name="property_type_id"
                  value={formData.property_type_id}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select Type</option>
                  {propertyTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Price (Rp)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Available Units</Form.Label>
                <Form.Control
                  type="number"
                  name="available_units"
                  value={formData.available_units}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Capacity</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Room Size (m²)</Form.Label>
                <Form.Control
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Bed Type</Form.Label>
                <Form.Control
                  type="text"
                  name="bed_type"
                  value={formData.bed_type}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>View</Form.Label>
                <Form.Control
                  type="text"
                  name="view"
                  value={formData.view}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Amenities</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Separate with commas"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
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
            {loading ? 'Creating...' : 'Create Accommodation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddAccommodationModal;