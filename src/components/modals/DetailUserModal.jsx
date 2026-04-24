// components/modals/DetailUserModal.jsx
import { Modal, Badge, Row, Col, Card, Table } from 'react-bootstrap';

const DetailUserModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  // Function untuk badge color
  const getRoleColor = (role) => {
    return role === 'ADMIN' ? 'danger' : 'primary';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSuperAdmin = user.id === 3;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a7856', color: 'white' }}>
        <Modal.Title>
          User Details - {user.name}
          {isSuperAdmin && (
            <Badge bg="warning" className="ms-2">
              Super Admin
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          {/* Kolom Kiri - Informasi User */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <strong>User Information</strong>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Name:</strong>
                  <p className="h5">{user.name}</p>
                </div>

                <div className="mb-3">
                  <strong>Email:</strong>
                  <p>{user.email}</p>
                </div>

                <Row className="mb-3">
                  <Col sm={6}>
                    <strong>Role:</strong>
                    <p>
                      <Badge bg={getRoleColor(user.role)} className="fs-6">
                        {user.role}
                      </Badge>
                    </p>
                  </Col>
                  <Col sm={6}>
                    <strong>Status:</strong>
                    <p>
                      <Badge bg={getStatusColor(user.is_active)} className="fs-6">
                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </p>
                  </Col>
                </Row>

                {user.phone && (
                  <div className="mb-3">
                    <strong>Phone:</strong>
                    <p>{user.phone}</p>
                  </div>
                )}

                {user.address && (
                  <div className="mb-3">
                    <strong>Address:</strong>
                    <p className="text-muted">{user.address}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Kolom Kanan - Metadata & Statistics */}
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <strong>Account Information</strong>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>User ID:</strong>
                  <p>{user.id}</p>
                </div>

                <div className="mb-3">
                  <strong>Joined Date:</strong>
                  <p>{formatDate(user.createdAt)}</p>
                </div>

                <div className="mb-3">
                  <strong>Last Updated:</strong>
                  <p>{formatDate(user.updatedAt)}</p>
                </div>

                {user.reservations && (
                  <div className="mb-3">
                    <strong>Total Reservations:</strong>
                    <p className="h5 text-primary">{user.reservations.length}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Card>
              <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
                <strong>Quick Stats</strong>
              </Card.Header>
              <Card.Body>
                {user.reservations ? (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Confirmed Reservations:</span>
                      <Badge bg="success">
                        {user.reservations.filter(r => r.status === 'CONFIRMED').length}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Checked-in:</span>
                      <Badge bg="info">
                        {user.reservations.filter(r => r.status === 'CHECKED_IN').length}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Completed:</span>
                      <Badge bg="primary">
                        {user.reservations.filter(r => r.status === 'CHECKED_OUT').length}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-muted text-center">No reservation data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Reservations (jika ada data) */}
        {user.reservations && user.reservations.length > 0 && (
          <Card className="mt-3">
            <Card.Header style={{ backgroundColor: '#f8f9fa' }}>
              <strong>Recent Reservations</strong>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table size="sm" striped>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Check-in</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.reservations.slice(0, 5).map(reservation => (
                      <tr key={reservation.id}>
                        <td>
                          <small>{reservation.reservation_code}</small>
                        </td>
                        <td>
                          <small>
                            {reservation.check_in ? new Date(reservation.check_in).toLocaleDateString('id-ID') : '-'}
                          </small>
                        </td>
                        <td>
                          <Badge bg={
                            reservation.status === 'CONFIRMED' ? 'success' :
                            reservation.status === 'CHECKED_IN' ? 'info' :
                            reservation.status === 'CHECKED_OUT' ? 'primary' : 'warning'
                          }>
                            {reservation.status?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-success">
                            Rp.{(reservation.price_total || 0).toLocaleString('id-ID')}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailUserModal;