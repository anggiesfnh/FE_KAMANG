import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useEffect, useState } from "react";
import { accommodationsAPI } from '../../services/api';

const EditAccommodationModal = ({ isOpen, onClose, accommodation, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    property_type_id: '',
    available_units: '',
    price: '',
    description: '',
    capacity: '',
    size: '',
    bed_type: '',
    amenities: '',
    view: ''
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    if (accommodation && accommodation.id) {
      setFormData({
        name: accommodation.name || '',
        property_type_id: accommodation.property_type_id || '',
        available_units: accommodation.available_units || '',
        price: accommodation.price || '',
        description: accommodation.description || '',
        capacity: accommodation.capacity || '',
        size: accommodation.size || '',
        bed_type: accommodation.bed_type || '',
        amenities: accommodation.amenities || '',
        view: accommodation.view || ''
      });
      setError('');
    }
  }, [accommodation]);

  const fetchPropertyTypes = async () => {
    try {
      const response = await fetch('http://kamangresort.pblweb0202.cloud:5000/api/property-types');
      const data = await response.json();
      setPropertyTypes(data.data || []);
    } catch (error) {
      console.error('Failed to fetch property types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!accommodation?.id) {
      setError('Accommodation ID tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        ...formData,
        available_units: parseInt(formData.available_units) || 0,
        price: parseFloat(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 1,
        size: parseInt(formData.size) || 0
      };

      const response = await accommodationsAPI.updateAccommodation(accommodation.id, updateData);
      
      onUpdate(response.data);
      onClose();
      
    } catch (error) {
      console.error('Error updating accommodation:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengupdate accommodation');
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

  if (!accommodation) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
        <Modal.Title>Edit {accommodation?.name}</Modal.Title>
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
            {loading ? 'Updating...' : 'Update Accommodation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditAccommodationModal;