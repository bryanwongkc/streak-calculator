import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TextInput } from '../../components/common/TextInput';

export const CreateGameModal = ({ open, onClose, onCreate, busy }) => {
  const [name, setName] = useState('');

  const handleCreate = async () => {
    await onCreate(name.trim() || 'Mahjong game');
    setName('');
  };

  return (
    <Modal
      open={open}
      title="Create game"
      onClose={onClose}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={busy}>Create</Button>
        </div>
      )}
    >
      <label className="space-y-2">
        <span className="text-sm font-semibold text-[#374151]">Game name</span>
        <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Friday mahjong" />
      </label>
    </Modal>
  );
};
