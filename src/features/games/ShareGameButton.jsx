import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, QrCode, Share2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const ShareGameButton = ({ game }) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const shareUrl = game?.id && game?.shareToken
    ? `${window.location.origin}${window.location.pathname}?game=${game.id}&token=${game.shareToken}`
    : '';

  useEffect(() => {
    if (!open || !shareUrl) return;

    QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    }).then(setQrDataUrl);
  }, [open, shareUrl]);

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: game.name, url: shareUrl });
        return;
      }
      await copyLink();
    } catch {
      await copyLink();
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={!shareUrl} icon={QrCode}>
        Share
      </Button>
      <Modal open={open} title="Share game" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#d1d5db]/80 bg-white p-3 text-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Game share QR code" className="mx-auto h-56 w-56" />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-[#6b7280]">Generating QR...</div>
            )}
          </div>
          <p className="break-all rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-2 text-xs text-[#6b7280]">{shareUrl}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={copyLink} icon={Copy}>{copied ? 'Copied' : 'Copy'}</Button>
            <Button variant="primary" onClick={handleNativeShare} icon={Share2}>Send</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
