// pages/Accommodation.jsx
import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import GenericTable from "../components/tables/GenericTable";
import EditAccommodationModal from '../components/modals/EditAccommodationModal';
import DetailAccommodationModal from '../components/modals/DetailAccommodationModal';
import AddAccommodationModal from '../components/modals/AddAccommodationModal';
import { accommodationsAPI } from '../services/api';

export default function Accommodation() {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);

    // State untuk modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAccommodation, setEditingAccommodation] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await accommodationsAPI.getAllAccommodations();
            console.log('API Response:', response.data);
            setAccommodations(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch accommodations:', error.response?.data || error.message);
            alert("Failed to load accommodations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this accommodation?"
        );
        if (!confirmDelete) return;

        try {
            await accommodationsAPI.deleteAccommodation(id);
            alert("Accommodation deleted successfully!");
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error.response?.data || error.message);
            alert("Failed to delete accommodation");
        }
    };

    const handleViewDetail = (accommodation) => {
        setSelectedAccommodation(accommodation);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAccommodation(null);
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
        setEditingAccommodation(null);
    };

    // FUNCTION EDIT
    const handleEdit = (accommodation) => {
        setEditingAccommodation(accommodation);
        setIsEditModalOpen(true);
    };

    // Function untuk menentukan warna berdasarkan property type
    const getTypeColor = (propertyTypeName) => {
        switch (propertyTypeName?.toLowerCase()) {
            case 'room':
                return 'info';
            case 'cottage':
                return 'warning';
            default:
                return 'secondary';
        }
    };


    // Columns configuration
    const columns = [
        { key: 'name', label: 'Accommodation Name' },
        { key: 'property_type', label: 'Type' },
        { key: 'available_units', label: 'Available' },
        { key: 'price', label: 'Price' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'bed_type', label: 'Bed Type' }
    ];

    // Row renderer
    const renderAccommodationRow = (acc) => {
        const typeColor = getTypeColor(acc.property_type?.name);
        const isAvailable = (acc.available_units || acc.available_rooms || 0) > 0;

        return [
            <td key="name">
                <strong
                    className="text-primary cursor-pointer"
                    onClick={() => handleViewDetail(acc)}
                    style={{ cursor: 'pointer' }}
                >
                    {acc.name || acc.room_name}
                </strong>
                <br />
                <small className="text-muted">{acc.property_type?.name}</small>
            </td>,
            <td key="type">
                <span className={`badge bg-${typeColor}`}>
                    {acc.property_type?.name}
                </span>
            </td>,
            <td key="available">
                <span className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'}`}>
                    {acc.available_units || acc.available_rooms || 0} {isAvailable ? 'Available' : 'Full'}
                </span>
            </td>,
            <td key="price" className="fw-bold text-success">
                Rp.{(acc.price || 0).toLocaleString('id-ID')}
            </td>,
            <td key="capacity">
                {acc.capacity} persons
            </td>,
            <td key="bed_type">
                {acc.bed_type}
            </td>,
            <td key="actions">
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleViewDetail(acc)}
                        title="View Details"
                    >
                        <FaEye />
                    </button>
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(acc)}
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(acc.id)}
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
                title="Accommodation Management"
                data={accommodations}
                columns={columns}
                renderRow={renderAccommodationRow}
                addButtonText="Add Accommodation"
                loading={loading}
                onAddButtonClick={handleOpenAddModal}
            />

            {/* Modal Add Accommodation */}
            <AddAccommodationModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={fetchData}
            />

            {/* EDIT MODAL */}
            <EditAccommodationModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                accommodation={editingAccommodation}
                onUpdate={fetchData}
            />

            {/* DETAIL MODAL */}
            <DetailAccommodationModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                accommodation={selectedAccommodation}
            />
        </>
    );
}