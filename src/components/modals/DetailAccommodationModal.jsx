import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';

const DetailAccommodationModal = ({ isOpen, onClose, accommodation }) => {
  if (!accommodation) return null;

  // Format amenities dari string ke array
  const amenitiesList = accommodation.amenities ? 
    (typeof accommodation.amenities === 'string' ? 
      accommodation.amenities.split(',').map(item => item.trim()) : 
      accommodation.amenities) : 
    [];

  const isAvailable = (accommodation.available_units || accommodation.available_rooms || 0) > 0;
  const typeColor = accommodation.property_type?.name?.toLowerCase() === 'cottage' ? 'warning' : 'info';

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
        <Modal.Title>
          {accommodation.name} - Details
          <Badge bg={typeColor} className="ms-2">
            {accommodation.property_type?.name}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Accommodation Name:</strong>
            <p className="fs-5">{accommodation.name}</p>
          </Col>
          <Col md={6}>
            <strong>Property Type:</strong>
            <p>
              <Badge bg={typeColor} className="fs-6">
                {accommodation.property_type?.name}
              </Badge>
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Price:</strong>
            <p className="fw-bold text-success fs-5">
              Rp.{(accommodation.price || 0).toLocaleString('id-ID')}
            </p>
          </Col>
          <Col md={6}>
            <strong>Available Units:</strong>
            <p>
              <Badge bg={isAvailable ? 'success' : 'danger'} className="fs-6">
                {accommodation.available_units || accommodation.available_rooms || 0} units
              </Badge>
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Capacity:</strong>
            <p className="fs-5">{accommodation.capacity} persons</p>
          </Col>
          <Col md={6}>
            <strong>Room Size:</strong>
            <p className="fs-5">{accommodation.size} m²</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>View:</strong>
            <p>{accommodation.view || 'N/A'}</p>
          </Col>
          <Col md={6}>
            <strong>Bed Type:</strong>
            <p className="fs-5">{accommodation.bed_type}</p>
          </Col>
        </Row>

        {amenitiesList.length > 0 && (
          <div className="mb-3">
            <strong>Amenities:</strong>
            <div className="mt-2">
              {amenitiesList.map((amenity, index) => (
                <Badge 
                  key={index} 
                  bg="secondary" 
                  className="me-2 mb-2 p-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <strong>Description:</strong>
          <p className="mt-2 p-3 bg-light rounded" style={{ textAlign: 'justify' }}>
            {accommodation.description || 'No description available.'}
          </p>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailAccommodationModal;