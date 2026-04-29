import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/common/TextInput';

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const RuleImageUploader = ({ onUpload, disabled }) => {
  const inputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().match(/\.(jpe?g|png|webp|heic|heif)$/)) {
      setMessage('Use JPG, PNG, WebP, or HEIC image files.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage('This image is over 8 MB. Please compress it first.');
      return;
    }

    setMessage('');
    await onUpload(file, title);
    setTitle('');
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="font-semibold text-[#111827]">Upload rule image</h2>
        <p className="text-sm text-[#6b7280]">Shared with everyone in this game.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextInput
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Optional title"
          disabled={disabled}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={disabled} icon={Upload}>
          Upload
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-[#6b7280]">{message}</p> : null}
    </Card>
  );
};
