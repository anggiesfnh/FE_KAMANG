// pages/Reservation.jsx
import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import GenericTable from "../components/tables/GenericTable";
import EditReservationModal from '../components/modals/EditReservationModal';
import DetailReservationModal from '../components/modals/DetailReservationModal';
import AddReservationModal from '../components/modals/AddReservationModal';
import { reservationsAPI } from '../services/api';

export default function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAllReservations();
      console.log('Reservations API Response:', response.data);
      setReservations(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error.response?.data || error.message);
      alert("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reservation?"
    );
    if (!confirmDelete) return;

    try {
      await reservationsAPI.deleteReservation(id);
      alert("Reservation deleted successfully!");
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error.response?.data || error.message);
      alert("Failed to delete reservation");
    }
  };

  const handleViewDetail = (reservation) => {
    setSelectedReservation(reservation);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReservation(null);
  };

  // FUNCTION UNTUK ADD MODAL
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReservation(null);
  };

  // FUNCTION EDIT
  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
  };

  // Function untuk menentukan badge color berdasarkan status
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CHECKED_IN':
        return 'info';
      case 'CHECKED_OUT':
        return 'primary';
      case 'CANCELLED':
        return 'danger';
      case 'EXPIRED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Function untuk format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Columns configuration
  const columns = [
    { key: 'reservation_code', label: 'Reservation Code' },
    { key: 'guest', label: 'Guest' },
    { key: 'dates', label: 'Dates' },
    { key: 'accommodations', label: 'Accommodations' },
    { key: 'price_total', label: 'Total Price' },
    { key: 'status', label: 'Status' }
  ];

  // Row renderer
  const renderReservationRow = (reservation) => {
    const statusColor = getStatusColor(reservation.status);
    const latestPayment = reservation.payments && reservation.payments.length > 0
      ? reservation.payments[0]
      : null;

    return [
      <td key="code">
        <strong
          className="text-primary cursor-pointer"
          onClick={() => handleViewDetail(reservation)}
          style={{ cursor: 'pointer' }}
        >
          {reservation.reservation_code}
        </strong>
        <br />
        <small className="text-muted">
          {formatDate(reservation.createdAt)}
        </small>
      </td>,
      <td key="guest">
        <div>
          <strong>{reservation.name}</strong>
          <br />
          <small className="text-muted">{reservation.email}</small>
          <br />
          <small>{reservation.phone}</small>
        </div>
      </td>,
      <td key="dates">
        <div>
          <strong>Check-in:</strong> {formatDate(reservation.check_in)}
          <br />
          <strong>Check-out:</strong> {formatDate(reservation.check_out)}
        </div>
      </td>,
      <td key="accommodations">
        {reservation.accommodations && reservation.accommodations.map((accRes, index) => (
          <div key={index}>
            <small>
              {accRes.qty}x {accRes.accommodation?.name}
            </small>
          </div>
        ))}
      </td>,
      <td key="price" className="fw-bold text-success">
        Rp.{(reservation.price_total || 0).toLocaleString('id-ID')}
      </td>,
      <td key="status">
        <span className={`badge bg-${statusColor}`}>
          {reservation.status?.replace('_', ' ')}
        </span>
        {latestPayment && (
          <>
            <br />
            <small className={`badge bg-${latestPayment.payment_status === 'PAID' ? 'success' : 'warning'}`}>
              {latestPayment.payment_status}
            </small>
          </>
        )}
      </td>,
      <td key="actions">
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => handleViewDetail(reservation)}
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(reservation)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(reservation.id)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    ];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <GenericTable
        title="Reservation Management"
        data={reservations}
        columns={columns}
        renderRow={renderReservationRow}
        addButtonText="Add Reservation"
        loading={loading}
        onAddButtonClick={handleOpenAddModal}
      />

      {/* Modal Add Reservation */}
      <AddReservationModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={fetchData}
      />

      {/* EDIT MODAL */}
      <EditReservationModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        reservation={editingReservation}
        onUpdate={fetchData}
      />

      {/* DETAIL MODAL */}
      <DetailReservationModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        reservation={selectedReservation}
      />
    </>
  );
}