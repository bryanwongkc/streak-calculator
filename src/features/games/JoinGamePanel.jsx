import React from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const JoinGamePanel = ({ message, onCreateGame, firebaseReady, onStartLocalDemo }) => (
  <Card className="mx-auto max-w-md p-5 text-center">
    <h1 className="text-xl font-semibold text-[#111827]">Mahjong game tracker</h1>
    <p className="mt-2 text-sm leading-6 text-[#6b7280]">
      {message || (firebaseReady ? 'Create a shared game to start tracking rounds.' : 'Firebase is not configured yet. Add the Vite env values to enable shared games.')}
    </p>
    <div className="mt-5 flex flex-col gap-2">
      {firebaseReady ? <Button variant="primary" onClick={onCreateGame}>Create game</Button> : null}
      {!firebaseReady ? <Button variant="secondary" onClick={onStartLocalDemo}>Start local demo game</Button> : null}
    </div>
  </Card>
);
