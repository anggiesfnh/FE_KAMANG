// pages/UserManagement.jsx
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaUserSlash, FaUserShield, FaUserCheck, FaPlus } from "react-icons/fa";
import GenericTable from "../components/tables/GenericTable";
import AddUserModal from '../components/modals/AddUserModal';
import DetailUserModal from '../components/modals/DetailUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import { usersAPI } from '../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Action handlers
  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await usersAPI.deactivateUser(id);
      alert('User deactivated successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert('Failed to deactivate user');
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this user?')) return;
    
    try {
      await usersAPI.updateUser(id, { is_active: true });
      alert('User activated successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Failed to activate user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    
    try {
      await usersAPI.deleteUser(id);
      alert('User deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleRoleUpdate = async (id, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await usersAPI.updateUserRole(id, { role: newRole });
      alert('User role updated successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  // Helper functions
  const getRoleColor = (role) => role === 'ADMIN' ? 'danger' : 'primary';
  const getStatusColor = (isActive) => isActive ? 'success' : 'secondary';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID') : '-';
  const isSuperAdmin = (user) => user.id === 3;

  const columns = [
    { key: 'user_info', label: 'User Info' },
    { key: 'contact', label: 'Contact' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Joined' }
  ];

  const renderUserRow = (user) => [
    <td key="info">
      <div>
        <strong>{user.name || 'No Name'}</strong>
        <br />
        <small className="text-muted">{user.email}</small>
        {isSuperAdmin(user) && (
          <div>
            <small className="badge bg-warning">Super Admin</small>
          </div>
        )}
      </div>
    </td>,
    <td key="contact">
      <div>
        <small>{user.phone || '-'}</small>
        <br />
        <small className="text-muted">{user.address || 'No address'}</small>
      </div>
    </td>,
    <td key="role">
      <span className={`badge bg-${getRoleColor(user.role)}`}>
        {user.role}
      </span>
      {!isSuperAdmin(user) && user.role === 'CUSTOMER' && (
        <button
          className="btn btn-sm btn-outline-danger ms-1"
          onClick={() => handleRoleUpdate(user.id, 'ADMIN')}
          title="Make Admin"
        >
          <FaUserShield />
        </button>
      )}
      {!isSuperAdmin(user) && user.role === 'ADMIN' && (
        <button
          className="btn btn-sm btn-outline-primary ms-1"
          onClick={() => handleRoleUpdate(user.id, 'CUSTOMER')}
          title="Make Customer"
        >
          <FaUserCheck />
        </button>
      )}
    </td>,
    <td key="status">
      <span className={`badge bg-${getStatusColor(user.is_active)}`}>
        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </td>,
    <td key="joined">
      {formatDate(user.createdAt)}
    </td>,
    <td key="actions">
      <div className="d-flex gap-1">
        <button
          className="btn btn-sm btn-outline-info"
          title="View Details"
          onClick={() => handleViewDetail(user)}
        >
          <FaEye />
        </button>
        
        <button
          className="btn btn-sm btn-outline-warning"
          title={isSuperAdmin(user) ? "Super Admin cannot be edited" : "Edit User"}
          onClick={() => handleEdit(user)}
          disabled={isSuperAdmin(user)}
        >
          <FaEdit />
        </button>
        
        {!isSuperAdmin(user) && (
          user.is_active ? (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleDeactivate(user.id)}
              title="Deactivate User"
            >
              <FaUserSlash />
            </button>
          ) : (
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => handleActivate(user.id)}
              title="Activate User"
            >
              <FaUserCheck />
            </button>
          )
        )}
        
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => !isSuperAdmin(user) && handleDelete(user.id)}
          title={isSuperAdmin(user) ? "Super Admin cannot be deleted" : "Delete User"}
          disabled={isSuperAdmin(user)}
        >
          <FaTrash />
        </button>
      </div>
    </td>
  ];

  return (
    <>
      <GenericTable
        title="User Management"
        data={users}
        columns={columns}
        renderRow={renderUserRow}
        loading={loading}
        addButtonText="Add User"
        onAddButtonClick={handleOpenAddModal}
        onRefresh={fetchData}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={fetchData}
      />

      <DetailUserModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onSuccess={fetchData}
      />
    </>
  );
}