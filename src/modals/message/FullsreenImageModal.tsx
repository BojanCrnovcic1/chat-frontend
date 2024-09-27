import React from 'react';
import './fullscreenImageModal.scss';

interface FullscreenImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fullscreen-modal" onClick={onClose}>
      <div className="fullscreen-modal-content">
        <img src={imageUrl} alt="Expanded" />
      </div>
    </div>
  );
};

export default FullscreenImageModal;
