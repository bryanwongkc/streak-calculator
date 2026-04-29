import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { RuleImageZoomModal } from './RuleImageZoomModal';

export const RuleImageGallery = ({ images, onDelete, disabled }) => {
  const [preview, setPreview] = useState(null);
  const [deleteImage, setDeleteImage] = useState(null);

  if (!images.length) {
    return (
      <EmptyState
        title="No rule images yet."
        description="Upload rule photos so everyone can check the same rules."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-xl border border-[#d1d5db]/80 bg-white/90">
            <button type="button" className="block w-full" onClick={() => setPreview(image)}>
              <img src={image.url} alt={image.title || 'Rule'} className="aspect-[4/3] w-full object-cover" />
            </button>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 sm:px-3 sm:py-2">
              <p className="truncate text-xs font-semibold text-[#374151] sm:text-sm">{image.title || 'Rule image'}</p>
              <Button size="icon" variant="ghost" disabled={disabled} onClick={() => setDeleteImage(image)} icon={Trash2} aria-label="Delete rule image" />
            </div>
          </div>
        ))}
      </div>

      <RuleImageZoomModal image={preview} onClose={() => setPreview(null)} />

      <ConfirmDialog
        open={Boolean(deleteImage)}
        title="Delete rule image"
        description="This removes the image metadata from the game and deletes the file from Firebase Storage."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteImage(null)}
        onConfirm={async () => {
          await onDelete(deleteImage);
          setDeleteImage(null);
        }}
      />
    </>
  );
};
