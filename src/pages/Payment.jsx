// pages/Payment.jsx
import { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import GenericTable from "../components/tables/GenericTable";
import DetailPaymentModal from '../components/modals/DetailPaymentModal'; // Import modal baru
import { paymentsAPI } from '../services/api';

export default function PaymentManagement() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await paymentsAPI.getPaymentHistory();
            setPayments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (payment) => {
        setSelectedPayment(payment);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPayment(null);
    };

    // Function untuk menentukan warna payment status
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

    // Function untuk reservation status color
    const getReservationStatusColor = (status) => {
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

    const columns = [
        { key: 'reservation_code', label: 'Reservation Code' },
        { key: 'guest_name', label: 'Guest' },
        { key: 'payment_code', label: 'Payment Code' },
        { key: 'amount', label: 'Amount' },
        { key: 'payment_status', label: 'Status' },
        { key: 'payment_method', label: 'Method' },
        { key: 'expires_at', label: 'Expires' },
        { key: 'reservation_status', label: 'Reservation Status' }
    ];

    const renderPaymentRow = (payment) => [
        <td key="code">
            <strong>{payment.reservation?.reservation_code || '-'}</strong>
        </td>,
        <td key="guest">
            <div>
                <strong>{payment.reservation?.name || '-'}</strong>
                <br />
                <small className="text-muted">{payment.reservation?.email || '-'}</small>
            </div>
        </td>,
        <td key="payment_code">
            {payment.payment_code || '-'}
        </td>,
        <td key="amount" className="fw-bold text-success">
            Rp.{(payment.amount || 0).toLocaleString('id-ID')}
        </td>,
        <td key="status">
            <span className={`badge bg-${getPaymentStatusColor(payment.payment_status)}`}>
                {payment.payment_status?.replace(/_/g, ' ') || 'PENDING'}
            </span>
        </td>,
        <td key="method">
            {payment.payment_method?.replace(/_/g, ' ') || 'BANK_TRANSFER'}
        </td>,
        <td key="expires">
            {payment.expires_at ? new Date(payment.expires_at).toLocaleDateString('id-ID') : '-'}
        </td>,
        <td key="reservation_status">
            <span className={`badge bg-${getReservationStatusColor(payment.reservation?.status)}`}>
                {payment.reservation?.status?.replace(/_/g, ' ') || 'PENDING'}
            </span>
        </td>,
        <td key="actions">
            <div className="d-flex gap-1">
                <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleViewDetail(payment)}
                    title="View Payment Details"
                >
                    <FaEye />
                </button>
            </div>
        </td>
    ];

    return (
        <>
            <GenericTable
                title="Payment Management"
                data={payments}
                columns={columns}
                renderRow={renderPaymentRow}
                loading={loading}
                addButtonText={false}
                onRefresh={fetchData}
            />

            {/* DETAIL PAYMENT MODAL */}
            <DetailPaymentModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                payment={selectedPayment}
            />
        </>
    );
}