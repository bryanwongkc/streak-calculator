import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';

export const JoinGamePanel = ({
  message,
  joinError,
  onCreateGame,
  onJoinGame,
  onOpenQrJoin,
  firebaseReady,
  onStartLocalDemo,
  busy,
}) => {
  const [mode, setMode] = useState('start');
  const [joinValue, setJoinValue] = useState('');

  return (
    <Card className="mx-auto w-full max-w-sm p-4 text-center md:max-w-md md:p-5">
      <h1 className="text-2xl font-semibold tracking-[0.16em] text-[#111827]">港式台灣牌</h1>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">
        {message || (firebaseReady ? 'Create a table or join with a host share link.' : 'Firebase is not configured yet. Add the Vite env values to enable shared games.')}
      </p>

      {mode === 'start' ? (
        <div className="mt-5 flex flex-col gap-2">
          <Button className="min-h-12" variant="primary" disabled={!firebaseReady || busy} onClick={onCreateGame}>Create New Game</Button>
          <Button className="min-h-12" variant="secondary" disabled={!firebaseReady || busy} onClick={() => setMode('join')}>Join Existing Game</Button>
          <Button className="min-h-12" variant="secondary" disabled={!firebaseReady || busy} onClick={onOpenQrJoin}>Scan QR Code</Button>
          {!firebaseReady ? <Button className="min-h-12" variant="secondary" onClick={onStartLocalDemo}>Start local demo game</Button> : null}
        </div>
      ) : (
        <div className="mt-5 space-y-3 text-left">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[#374151]">Share link or code</span>
            <TextInput
              value={joinValue}
              onChange={(event) => setJoinValue(event.target.value)}
              placeholder="https://domain.com/?game=...&token=..."
            />
          </label>
          {joinError ? <p className="text-sm text-[#6b7280]">{joinError}</p> : null}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setMode('start')}>Back</Button>
            <Button variant="primary" disabled={busy || !joinValue.trim()} onClick={() => onJoinGame(joinValue.trim())}>Join</Button>
          </div>
        </div>
      )}
    </Card>
  );
};
