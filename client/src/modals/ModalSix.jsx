import React from 'react';
import ReactDOM from 'react-dom';

export default function ModalSix({ isOpen, onClose, children }) {
  if (!isOpen) return null; // ✅ Use isOpen here — but DO NOT pass it to <div>

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-six-root')
  );
}
