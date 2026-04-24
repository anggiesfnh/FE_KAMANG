const StatCard = ({ title, value, icon, color = "primary" }) => {
  const colorMap = {
    primary: "text-primary",
    success: "text-success", 
    warning: "text-warning",
    info: "text-info"
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
          </div>
          <div className={`${colorMap[color]} fs-4`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;