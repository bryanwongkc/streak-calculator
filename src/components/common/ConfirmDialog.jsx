import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  open,
  title = 'Confirm',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    footer={(
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    )}
  >
    <p className="text-sm leading-6 text-[#4b5563]">{description}</p>
  </Modal>
);
