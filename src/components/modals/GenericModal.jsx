const GenericModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl
  showHeader = true,
  showFooter = false,
  footerContent
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`modal fade show`} 
        style={{ display: 'block' }} 
        tabIndex="-1"
      >
        <div className={`modal-dialog modal-${size} modal-dialog-centered`}>
          <div className="modal-content">
            {showHeader && (
              <div className="modal-header" style={{ backgroundColor: '#4a7856', color: 'white' }}>
                <h5 className="modal-title">{title}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={onClose}
                ></button>
              </div>
            )}
            
            <div className="modal-body">
              {children}
            </div>

            {showFooter && (
              <div className="modal-footer">
                {footerContent || (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Close
                    </button>
                    <button type="button" className="btn btn-primary">
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default GenericModal;