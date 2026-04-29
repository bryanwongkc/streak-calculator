import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, Settings2, Undo2, UserCircle, Wrench, XCircle } from 'lucide-react';
import { Button } from '../common/Button';

export const SettingsMenu = ({
  isEditingNames,
  onToggleEditNames,
  showAdjustments,
  onToggleAdjustments,
  onUndo,
  onReset,
  onResetKeepNames,
  canUndo,
}) => {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        <div className="settings-popover absolute right-0 top-full z-40 mt-2 w-56 space-y-2 rounded-xl border border-[#d1d5db]/90 bg-white/95 p-2 shadow-[0_24px_60px_rgba(148,163,184,0.24)] backdrop-blur-xl">
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
    </div>
  );
};
