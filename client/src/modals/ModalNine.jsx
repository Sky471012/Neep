import ReactDOM from 'react-dom';

export default function ModalNine({ isOpen, onClose, children }) {
  if (!isOpen) return null; // ✅ Use isOpen here — but DO NOT pass it to <div>

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-nine-root')
  );
}
