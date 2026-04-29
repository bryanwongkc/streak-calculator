import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { NumberInput } from '../../components/common/NumberInput';
import { TextInput } from '../../components/common/TextInput';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { createId } from '../../utils/ids';

const CHIP_SWATCHES = [
  '#dc2626',
  '#facc15',
  '#f8fafc',
  '#2563eb',
  '#111827',
  '#7c3aed',
  '#16a34a',
  '#f97316',
];

export const ChipColorConfig = ({ colors, onChange, disabled }) => {
  const [deleteId, setDeleteId] = useState(null);
  const [expandedColorId, setExpandedColorId] = useState(null);

  const updateColor = (id, patch) => {
    onChange(colors.map((color) => (color.id === id ? { ...color, ...patch } : color)));
  };

  const addColor = () => {
    onChange([
      ...colors,
      { id: createId('chip'), name: 'New chip', value: 0, colorHex: '#6b7280' },
    ]);
  };

  const isLightSwatch = (hex = '') => ['#ffffff', '#f8fafc', '#facc15'].includes(hex.toLowerCase());

  return (
    <Card className="p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[#111827]">Chip colors</h2>
          <p className="text-sm text-[#6b7280]">Shared setup for this game.</p>
        </div>
        <Button size="sm" onClick={addColor} disabled={disabled} icon={Plus}>Add</Button>
      </div>

      <div className="space-y-2">
        {colors.map((color) => (
          <div key={color.id} className="grid grid-cols-[32px_minmax(0,1fr)_80px_36px] items-center gap-1.5 md:grid-cols-[36px_minmax(0,1fr)_92px_40px] md:gap-2">
            <button
              type="button"
              onClick={() => setExpandedColorId((currentId) => (currentId === color.id ? null : color.id))}
              disabled={disabled}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white disabled:opacity-50 md:h-9 md:w-9"
              aria-label={`${color.name} display color`}
              title="Choose color"
            >
              <span
                className={`h-5 w-5 rounded-full ${isLightSwatch(color.colorHex) ? 'border-2 border-[#94a3b8]' : 'border border-[#cbd5e1]'}`}
                style={{ backgroundColor: color.colorHex || '#6b7280' }}
              />
            </button>
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
            {expandedColorId === color.id ? (
              <div className="col-span-4 grid grid-cols-8 gap-1 rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-1.5">
                {CHIP_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      updateColor(color.id, { colorHex: swatch });
                      setExpandedColorId(null);
                    }}
                    className={`flex h-8 items-center justify-center rounded-md border bg-white ${color.colorHex?.toLowerCase() === swatch.toLowerCase() ? 'border-[#111827]' : 'border-[#d1d5db]'}`}
                    aria-label={`Set ${color.name} color to ${swatch}`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full ${isLightSwatch(swatch) ? 'border-2 border-[#94a3b8]' : 'border border-[#cbd5e1]'}`}
                      style={{ backgroundColor: swatch }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
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
