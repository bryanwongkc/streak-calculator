import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Image, Link2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TextInput } from '../../components/common/TextInput';

export const JoinByQrModal = ({ open, onClose, onJoin, busy, error }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [manualValue, setManualValue] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const stopCamera = (updateState = true) => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (updateState) setCameraActive(false);
  };

  useEffect(() => () => stopCamera(false), []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setManualValue('');
      setScanMessage('');
    }
  }, [open]);

  const handleDetected = async (value) => {
    if (!value) return;
    stopCamera();
    const ok = await onJoin(value);
    if (ok) onClose();
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      frameRef.current = window.requestAnimationFrame(scanFrame);
      return;
    }

    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        await handleDetected(code.data);
        return;
      }
    } catch {
      setScanMessage('Point the camera at the QR code and hold steady.');
    }

    frameRef.current = window.requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setScanMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      frameRef.current = window.requestAnimationFrame(scanFrame);
    } catch {
      setScanMessage('Camera access was not available. Upload a QR screenshot or paste the share link.');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const image = await createImageBitmap(file);
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      image.close?.();
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code?.data) {
        setScanMessage('No QR code found in that image.');
        return;
      }
      await handleDetected(code.data);
    } catch {
      setScanMessage('Could not read that QR image.');
    }
  };

  return (
    <Modal open={open} title="Join with QR code" onClose={onClose}>
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-[#d1d5db]/80 bg-[#111827]">
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant={cameraActive ? 'primary' : 'secondary'} onClick={cameraActive ? stopCamera : startCamera} disabled={busy} icon={Camera}>
            {cameraActive ? 'Stop' : 'Scan QR'}
          </Button>
          <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d1d5db]/80 bg-white/90 px-4 py-2 text-sm font-semibold text-[#374151]">
            <Image size={18} />
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#374151]">Or paste share link</label>
          <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
            <TextInput
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
              placeholder="https://.../?game=..."
            />
            <Button variant="primary" disabled={busy || !manualValue.trim()} onClick={async () => {
              const ok = await onJoin(manualValue.trim());
              if (ok) onClose();
            }} icon={Link2}>
              Join
            </Button>
          </div>
        </div>

        {scanMessage || error ? (
          <p className="text-sm leading-5 text-[#6b7280]">{error || scanMessage}</p>
        ) : null}
      </div>
    </Modal>
  );
};
