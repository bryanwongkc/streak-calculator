import React, { useState } from 'react';
import { uploadRuleImage, deleteRuleImageFile } from '../../firebase/ruleImageService';
import { RuleImageUploader } from './RuleImageUploader';
import { RuleImageGallery } from './RuleImageGallery';

export const RulesTab = ({ game, user, onUpdateGame, firebaseReady }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const images = game.ruleImages || [];

  const handleUpload = async (file, title) => {
    if (!firebaseReady) {
      setError('Firebase Storage is not configured.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const image = await uploadRuleImage({
        gameId: game.id,
        file,
        title,
        userId: user?.uid,
      });
      await onUpdateGame({ ruleImages: [image, ...images] });
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (image) => {
    setBusy(true);
    setError('');
    try {
      await deleteRuleImageFile(image.storagePath);
      await onUpdateGame({ ruleImages: images.filter((item) => item.id !== image.id) });
    } catch (deleteError) {
      setError(deleteError.message || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <RuleImageUploader onUpload={handleUpload} disabled={busy || !firebaseReady} />
      {error ? <div className="rounded-lg border border-[#d1d5db]/80 bg-white/90 px-3 py-2 text-sm text-[#6b7280]">{error}</div> : null}
      <RuleImageGallery images={images} onDelete={handleDelete} disabled={busy || !firebaseReady} />
    </div>
  );
};
