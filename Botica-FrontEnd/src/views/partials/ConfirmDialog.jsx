import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar acción', 
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'btn-danger',
          icon: '⚠️'
        };
      case 'warning':
        return {
          confirmButton: 'btn-warning',
          icon: '⚠️'
        };
      case 'info':
        return {
          confirmButton: 'btn-primary',
          icon: 'ℹ️'
        };
      default:
        return {
          confirmButton: 'btn-primary',
          icon: '❓'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          {styles.icon}
        </div>
        <div className="confirm-message">
          {message}
        </div>
        <div className="confirm-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            className={styles.confirmButton}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}