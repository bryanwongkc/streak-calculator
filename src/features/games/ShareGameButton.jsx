import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const ShareGameButton = ({ game }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = game?.id && game?.shareToken
    ? `${window.location.origin}${window.location.pathname}?game=${game.id}&token=${game.shareToken}`
    : '';

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: game.name, url: shareUrl });
      } catch {
        await navigator.clipboard.writeText(shareUrl);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Button size="sm" onClick={handleShare} disabled={!shareUrl} icon={Share2}>
      {copied ? 'Copied' : 'Share'}
    </Button>
  );
};
