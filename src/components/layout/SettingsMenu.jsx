import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Plus, RotateCcw, Settings2, Trash2, Undo2, UserCircle, Wrench, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsMenu = ({
  isEditingNames,
  onToggleEditNames,
  showAdjustments,
  onToggleAdjustments,
  onUndo,
  onReset,
  onResetKeepNames,
  canUndo,
  games,
  activeGameId,
  onSelectGame,
  onCreateGame,
  onDeleteGame,
}) => {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteGame, setConfirmDeleteGame] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeGameName = games.find((game) => game.gameId === activeGameId)?.name || 'this game';

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
        setConfirmReset(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setConfirmReset(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  const itemClass = 'w-full justify-start';

  return (
    <div ref={menuRef} className="relative shrink-0">
      <Button
        aria-label="Open settings"
        size="icon"
        variant={open ? 'primary' : 'secondary'}
        onClick={() => setOpen((value) => !value)}
        icon={Settings2}
      />

      {open ? (
        <div className="settings-popover absolute right-0 top-full z-40 mt-2 w-72 space-y-2 rounded-xl border border-[#d1d5db]/90 bg-white/95 p-2 shadow-[0_24px_60px_rgba(148,163,184,0.24)] backdrop-blur-xl">
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7280]">
              Game
            </label>
            <div className="flex gap-1">
              <select
                value={activeGameId || ''}
                onChange={(event) => onSelectGame(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#d1d5db]/80 bg-white px-2 py-2 text-sm font-semibold text-[#374151] outline-none focus:ring-2 focus:ring-[#9ca3af]/40"
                aria-label="Switch game"
              >
                {games.length === 0 ? <option value="">No games</option> : null}
                {games.map((game) => (
                  <option key={game.gameId} value={game.gameId}>{game.name}</option>
                ))}
              </select>
              <Button size="icon" variant="secondary" onClick={onCreateGame} icon={Plus} aria-label="Create game" />
              <Button size="icon" variant="ghost" disabled={!activeGameId} onClick={() => setConfirmDeleteGame(true)} icon={Trash2} aria-label="Delete game" />
            </div>
          </div>

          <Button className={itemClass} variant={isEditingNames ? 'primary' : 'secondary'} onClick={onToggleEditNames} icon={UserCircle}>
            {isEditingNames ? 'Done editing' : 'Edit names'}
          </Button>
          <Button className={itemClass} variant={showAdjustments ? 'primary' : 'secondary'} onClick={onToggleAdjustments} icon={Wrench}>
            Adjustments
          </Button>
          <Button className={itemClass} variant="secondary" onClick={toggleFullscreen} icon={isFullscreen ? Minimize2 : Maximize2}>
            {isFullscreen ? 'Exit full' : 'Fullscreen'}
          </Button>
          <Button className={itemClass} variant="secondary" onClick={onUndo} disabled={!canUndo} icon={Undo2}>
            Undo
          </Button>

          {confirmReset ? (
            <div className="space-y-2">
              <Button className={itemClass} variant="primary" onClick={() => { onResetKeepNames(); setConfirmReset(false); setOpen(false); }} icon={RotateCcw}>
                Reset keep names
              </Button>
              <div className="flex gap-1">
                <Button className="flex-1" variant="danger" onClick={() => { onReset(); setConfirmReset(false); setOpen(false); }}>
                  Full reset
                </Button>
                <Button size="icon" variant="secondary" onClick={() => setConfirmReset(false)} icon={XCircle} aria-label="Cancel reset" />
              </div>
            </div>
          ) : (
            <Button className={itemClass} variant="secondary" onClick={() => setConfirmReset(true)} icon={RotateCcw}>
              Reset
            </Button>
          )}
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmDeleteGame}
        title="Delete game"
        description={`Delete ${activeGameName}? This removes it for everyone if it is a shared Firestore game.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDeleteGame(false)}
        onConfirm={async () => {
          await onDeleteGame();
          setConfirmDeleteGame(false);
          setOpen(false);
        }}
      />
    </div>
  );
};
