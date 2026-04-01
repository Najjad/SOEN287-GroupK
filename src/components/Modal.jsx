function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const widths = {
    sm: "420px",
    md: "560px",
    lg: "760px",
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel" style={{ width: `min(92vw, ${widths[size]})` }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
