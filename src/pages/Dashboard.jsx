// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import StatCard from "../components/cards/StatCard";
import { reservationsAPI, paymentsAPI, accommodationsAPI } from '../services/api';
import { TbCalendarMonth, TbBed, TbReportMoney } from "react-icons/tb";
import { RiBarChartBoxLine } from "react-icons/ri";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReservations: 0,
    availableRooms: "0/0",
    totalRevenue: 0,
    occupancyRate: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    pendingPayments: 0,
    paymentStatus: { paid: 0, pending: 0, waiting_verification: 0, expired: 0 },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Pindahkan function di sini (sebelum fetchDashboardData)
  const getActivityType = (reservation, payment) => {
    if (reservation.status === 'CHECKED_IN') return 'checked_in';
    if (reservation.status === 'CHECKED_OUT') return 'checked_out';
    if (payment?.payment_status === 'PAID') return 'payment_received';
    if (reservation.status === 'CONFIRMED') return 'reservation_confirmed';
    return 'new_reservation';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'checked_in':
        return `${activity.guestName} checked into ${activity.room}`;
      case 'checked_out':
        return `${activity.guestName} checked out from ${activity.room}`;
      case 'payment_received':
        return `Payment received from ${activity.guestName}`;
      case 'reservation_confirmed':
        return `Reservation confirmed for ${activity.guestName}`;
      default:
        return `${activity.guestName} made a new reservation for ${activity.room}`;
    }
  };

  const getStatusBadge = (activity) => {
    if (activity.paymentStatus === 'PAID') {
      return <span className="badge bg-success">{formatCurrency(activity.amount)}</span>;
    }
    
    const statusConfig = {
      'CHECKED_IN': { color: 'success', text: 'Checked In' },
      'CHECKED_OUT': { color: 'primary', text: 'Checked Out' },
      'CONFIRMED': { color: 'info', text: 'Confirmed' },
      'PENDING': { color: 'warning', text: 'Pending' }
    };
    
    const config = statusConfig[activity.status] || { color: 'secondary', text: activity.status };
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      waiting_verification: 'info',
      expired: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch semua data parallel
      const [reservationsRes, paymentsRes, accommodationsRes] = await Promise.all([
        reservationsAPI.getAllReservations(),
        paymentsAPI.getPaymentHistory(),
        accommodationsAPI.getAllAccommodations()
      ]);

      const reservations = reservationsRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const accommodations = accommodationsRes.data.data || [];

      console.log('📊 Raw Data:', {
        reservations: reservations.length,
        payments: payments.length,
        accommodations: accommodations.length,
        accommodationsSample: accommodations[0],
        reservationsSample: reservations[0]
      });

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      
      const totalReservations = reservations.length;
      
      // Fix Occupancy Rate Calculation
      let totalRooms = 0;
      let occupiedRooms = 0;

      // Calculate total rooms from accommodations (gunakan available_units atau quantity)
      accommodations.forEach(acc => {
        totalRooms += acc.available_units || acc.quantity || 1;
      });

      // Calculate occupied rooms from active reservations
      reservations.forEach(reservation => {
        if (reservation.status === 'CHECKED_IN' || reservation.status === 'CONFIRMED') {
          if (reservation.accommodations && reservation.accommodations.length > 0) {
            reservation.accommodations.forEach(accRes => {
              occupiedRooms += accRes.qty || 1;
            });
          } else {
            // If no accommodations data, count as 1 room
            occupiedRooms += 1;
          }
        }
      });

      const availableRooms = Math.max(0, totalRooms - occupiedRooms);
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      console.log('🏨 Room Calculation:', {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate
      });
      
      const totalRevenue = payments
        .filter(p => p.payment_status === 'PAID')
        .reduce((sum, p) => sum + (p.amount_paid || p.amount || 0), 0);
      
      const todayCheckins = reservations.filter(r => 
        r.check_in && r.check_in.split('T')[0] === today && 
        (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
      ).length;
      
      const todayCheckouts = reservations.filter(r => 
        r.check_out && r.check_out.split('T')[0] === today && 
        (r.status === 'CHECKED_IN' || r.status === 'CHECKED_OUT')
      ).length;
      
      const pendingPayments = payments.filter(p => 
        p.payment_status === 'PENDING' || p.payment_status === 'WAITING_VERIFICATION'
      ).length;

      // Payment Status Breakdown
      const paymentStatus = {
        paid: payments.filter(p => p.payment_status === 'PAID').length,
        pending: payments.filter(p => p.payment_status === 'PENDING').length,
        waiting_verification: payments.filter(p => p.payment_status === 'WAITING_VERIFICATION').length,
        expired: payments.filter(p => p.payment_status === 'EXPIRED').length
      };

      // Recent activities dengan room name yang benar
      const recentActivities = reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(reservation => {
          const reservationPayments = payments.filter(p => p.reservation_id === reservation.id);
          const latestPayment = reservationPayments[0];
          
          // Get room name dari accommodations data
          let roomName = 'Room';
          if (reservation.accommodations && reservation.accommodations.length > 0) {
            const firstAccommodation = reservation.accommodations[0];
            roomName = firstAccommodation.accommodation?.name || firstAccommodation.name || 'Room';
          }
          
          return {
            id: reservation.id,
            guestName: reservation.name,
            room: roomName,
            type: getActivityType(reservation, latestPayment),
            timestamp: reservation.createdAt,
            status: reservation.status,
            amount: latestPayment?.amount,
            paymentStatus: latestPayment?.payment_status
          };
        });

      const newStats = {
        totalReservations,
        availableRooms: `${availableRooms}/${totalRooms}`,
        totalRevenue,
        occupancyRate,
        todayCheckins,
        todayCheckouts,
        pendingPayments,
        paymentStatus,
        recentActivities
      };

      console.log('✅ Final Stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard Overview</h2>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh Data
        </button>
      </div>
      
      {/* Metric Cards - 4 kolom */}
      <div className="row mb-5">
        <div className="col-xl-3 col-md-6 mb-3">
          <StatCard 
            title="Total Reservations" 
            value={stats.totalReservations} 
            icon={<TbCalendarMonth size={24} />}
            color="primary"
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <StatCard 
            title="Available Rooms" 
            value={stats.availableRooms} 
            icon={<TbBed size={24} />}
            color="success"
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <StatCard 
            title="Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<TbReportMoney size={24} />}
            color="warning"
          />
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <StatCard 
            title="Occupancy Rate" 
            value={`${stats.occupancyRate}%`} 
            icon={<RiBarChartBoxLine size={24} />}
            color="info"
          />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row mb-5">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-4">Today's Overview</h5>
              <div className="row text-center">
                <div className="col-4 border-end">
                  <h6 className="text-muted">Check-ins Today</h6>
                  <h4 className="text-primary">{stats.todayCheckins}</h4>
                </div>
                <div className="col-4 border-end">
                  <h6 className="text-muted">Check-outs Today</h6>
                  <h4 className="text-info">{stats.todayCheckouts}</h4>
                </div>
                <div className="col-4">
                  <h6 className="text-muted">Pending Payments</h6>
                  <h4 className="text-warning">{stats.pendingPayments}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Payment Status</h5>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <span>Paid</span>
                <span className={`badge bg-${getPaymentStatusColor('paid')}`}>
                  {stats.paymentStatus.paid}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <span>Pending</span>
                <span className={`badge bg-${getPaymentStatusColor('pending')}`}>
                  {stats.paymentStatus.pending}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <span>Waiting Verification</span>
                <span className={`badge bg-${getPaymentStatusColor('waiting_verification')}`}>
                  {stats.paymentStatus.waiting_verification}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                <span>Expired</span>
                <span className={`badge bg-${getPaymentStatusColor('expired')}`}>
                  {stats.paymentStatus.expired}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Recent Activity</h5>
            <a href="/reservations" className="btn btn-sm btn-outline-primary">
              View All Reservations
            </a>
          </div>
          
          {stats.recentActivities.length === 0 ? (
            <p className="text-muted text-center py-4">No recent activities</p>
          ) : (
            <div className="list-group list-group-flush">
              {stats.recentActivities.map(activity => (
                <div key={activity.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <span className="fw-bold">{getActivityMessage(activity)}</span>
                    <br />
                    <small className="text-muted">{formatTimeAgo(activity.timestamp)}</small>
                  </div>
                  <div>
                    {getStatusBadge(activity)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;