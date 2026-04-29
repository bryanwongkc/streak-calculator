import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TextInput } from '../../components/common/TextInput';
import { INITIAL_PLAYERS } from '../game/gameTypes';

export const CreateGameModal = ({ open, onClose, onCreate, busy }) => {
  const [name, setName] = useState('');
  const [playerNames, setPlayerNames] = useState(() => INITIAL_PLAYERS.map((player) => player.name));

  const handleCreate = async () => {
    const players = INITIAL_PLAYERS.map((player, index) => ({
      ...player,
      name: playerNames[index]?.trim() || player.name,
    }));
    await onCreate(name.trim(), players);
    setName('');
    setPlayerNames(INITIAL_PLAYERS.map((player) => player.name));
  };

  return (
    <Modal
      open={open}
      title="Create game"
      onClose={onClose}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={busy || !name.trim()}>Create</Button>
        </div>
      )}
    >
      <div className="space-y-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-[#374151]">Game name</span>
          <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Friday mahjong" required />
        </label>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#374151]">Player names</p>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_PLAYERS.map((player, index) => (
              <TextInput
                key={player.id}
                value={playerNames[index]}
                onChange={(event) => setPlayerNames((prev) => prev.map((value, itemIndex) => (
                  itemIndex === index ? event.target.value : value
                )))}
                placeholder={player.name}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
