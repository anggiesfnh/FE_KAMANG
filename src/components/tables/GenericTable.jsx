import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';

const GenericTable = ({
  title,
  data,
  columns,
  renderRow,
  searchable = true,
  addButtonText = "Add New",
  loading = false,
  onAddButtonClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Helper functions - DIPINDAH SEMUA KE ATAS
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current ? current[key] : undefined;
    }, obj);
  };

  const isDateInRange = (selectedDate, checkIn, checkOut) => {
    const selected = new Date(selectedDate);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Set waktu ke 00:00:00 untuk perbandingan tanggal saja
    selected.setHours(0, 0, 0, 0);
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);
    
    return selected >= checkInDate && selected <= checkOutDate;
  };

  // Filter data berdasarkan search term, status, dan tanggal
  const filteredData = data?.filter(item => {
    // Filter by search term (search across all columns)
    const matchesSearch = searchTerm === '' || 
      columns.some(col => {
        const value = getNestedValue(item, col.key);
        if (value === null || value === undefined) return false;
        
        // Handle different data types
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        if (value instanceof Date) {
          return value.toLocaleDateString().includes(searchTerm);
        }
        return false;
      });

    // Filter by status (if status field exists)
    const matchesStatus = statusFilter === '' || 
      (item.status && item.status.toLowerCase().includes(statusFilter.toLowerCase()));

    // Filter by date - khusus untuk reservation (check if date falls within check_in - check_out range)
    const matchesDate = dateFilter === '' || 
      (item.check_in && item.check_out && isDateInRange(dateFilter, item.check_in, item.check_out));

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  // Get unique statuses for filter dropdown
  const uniqueStatuses = data ? [...new Set(data.map(item => item.status).filter(Boolean))] : [];

  // Check if data has reservation date fields (check_in & check_out)
  const hasReservationDates = data && data.some(item => item.check_in && item.check_out);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset ke page 1 ketika search/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav>
        <ul className="pagination mb-0">
          {/* Previous Button */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {/* First Page */}
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {/* Page Numbers */}
          {pages.map(page => (
            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            </li>
          ))}

          {/* Last Page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next Button */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="spinner-border text-info" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold" style={{ color: '#2d4a35' }}>{title}</h1>
        
        {/* Add Button */}
        {addButtonText && (
          <button 
            className="btn text-white" 
            style={{ backgroundColor: '#4a7856' }}
            onClick={onAddButtonClick}
          >
            <FaPlus className="me-1" />
            {addButtonText}
          </button>
        )}
      </div>

      {/* Search & Filter Section */}
      {searchable && (
        <div className="row mb-4">
          {/* Global Search */}
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter (only show if data has status) */}
          {uniqueStatuses.length > 0 && (
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text"><FaFilter /></span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date Filter (only show for reservations) */}
          {hasReservationDates && (
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text"><FaCalendarAlt /></span>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by stay date"
                />
              </div>
            </div>
          )}

          {/* Items Per Page */}
          <div className="col-md-2">
            <select
              className="form-select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter || dateFilter) && (
            <div className="col-md-12 mt-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDateFilter('');
                }}
              >
                Clear All Filters
              </button>
              <small className="text-muted ms-2">
                Showing {filteredData.length} of {data?.length || 0} records
              </small>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">No</th>
                  {columns.map((col) => (
                    <th key={col.key} scope="col">{col.label}</th>
                  ))}
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="text-center py-4">
                      {data?.length === 0 ? 'No data available' : 'No matching records found'}
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{startIndex + index + 1}</td>
                      {renderRow(item)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Showing {currentData.length} of {totalItems} items
              {(searchTerm || statusFilter || dateFilter) && ' (filtered)'}
            </div>
            <PaginationComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericTable;