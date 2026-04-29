import React, { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const RuleImageZoomModal = ({ image, onClose }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [image?.url]);

  if (!image) return null;

  const zoomIn = () => setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((current) => Math.max(0.75, Number((current - 0.25).toFixed(2))));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#111827]/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#111827]/95 px-3 py-2 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{image.title || 'Rule image'}</p>
          <p className="text-xs text-white/60">{Math.round(zoom * 100)}%</p>
        </div>
        <div className="flex items-center gap-1">
          <Button aria-label="Zoom out" size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={zoomOut} icon={Minus} />
          <Button aria-label="Reset zoom" size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setZoom(1)} icon={RotateCcw} />
          <Button aria-label="Zoom in" size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={zoomIn} icon={Plus} />
          <Button aria-label="Close" size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={onClose} icon={X} />
        </div>
      </div>

      <div className="flex-1 overflow-auto overscroll-contain p-2">
        <div className="mx-auto min-h-full w-fit">
          <img
            src={image.url}
            alt={image.title || 'Rule image'}
            className="max-w-none rounded-lg bg-white shadow-2xl"
            style={{
              width: `${Math.max(100, zoom * 100)}vw`,
              maxWidth: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
