import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean; // To show loading state on confirm button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;