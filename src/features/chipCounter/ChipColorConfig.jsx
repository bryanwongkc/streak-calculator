import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { TextInput } from '../../components/common/TextInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { createId } from '../../utils/ids';

export const ChipColorConfig = ({ colors, onChange, disabled }) => {
  const [deleteId, setDeleteId] = useState(null);

  const updateColor = (id, patch) => {
    onChange(colors.map((color) => (color.id === id ? { ...color, ...patch } : color)));
  };

  const addColor = () => {
    onChange([
      ...colors,
      { id: createId('chip'), name: 'New chip', value: 0, colorHex: '#6b7280' },
    ]);
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[#111827]">Chip colors</h2>
          <p className="text-sm text-[#6b7280]">Shared setup for this game.</p>
        </div>
        <Button size="sm" onClick={addColor} disabled={disabled} icon={Plus}>Add</Button>
      </div>

      <div className="space-y-3">
        {colors.map((color) => (
          <div key={color.id} className="grid grid-cols-[36px_1fr_92px_40px] items-center gap-2">
            <input
              type="color"
              value={color.colorHex || '#6b7280'}
              onChange={(event) => updateColor(color.id, { colorHex: event.target.value })}
              className="h-9 w-9 rounded border border-[#d1d5db]"
              aria-label={`${color.name} display color`}
            />
            <TextInput
              value={color.name}
              onChange={(event) => updateColor(color.id, { name: event.target.value })}
              disabled={disabled}
            />
            <NumberInput
              value={color.value}
              onChange={(value) => updateColor(color.id, { value: Math.max(0, parseInt(value, 10) || 0) })}
              disabled={disabled}
            />
            <Button aria-label={`Delete ${color.name}`} size="icon" variant="ghost" disabled={disabled || colors.length <= 1} onClick={() => setDeleteId(color.id)} icon={Trash2} />
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete chip color"
        description="This removes the color from shared setup and initial stacks."
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          onChange(colors.filter((color) => color.id !== deleteId));
          setDeleteId(null);
        }}
      />
    </Card>
  );
};
