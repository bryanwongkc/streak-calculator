import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { RuleImageZoomModal } from './RuleImageZoomModal';

const BUILT_IN_RULE_IMAGES = [
  { id: 'rules-1', title: 'Rule Sheet 1', url: '/rules/hk-taiwan-rules-1.png' },
  { id: 'rules-2', title: 'Rule Sheet 2', url: '/rules/hk-taiwan-rules-2.png' },
  { id: 'rules-3', title: 'Rule Sheet 3', url: '/rules/hk-taiwan-rules-3.png' },
  { id: 'rules-4', title: 'Rule Sheet 4', url: '/rules/hk-taiwan-rules-4.png' },
  { id: 'rules-5', title: 'Rule Sheet 5', url: '/rules/hk-taiwan-rules-5.png' },
  { id: 'rules-6', title: 'Rule Sheet 6', url: '/rules/hk-taiwan-rules-6.png' },
  { id: 'rules-7', title: 'Rule Sheet 7', url: '/rules/hk-taiwan-rules-7.png' },
];

export const BuiltInRuleGallery = () => {
  const [preview, setPreview] = useState(null);
  const [missingImages, setMissingImages] = useState({});

  const visibleImages = BUILT_IN_RULE_IMAGES.filter((image) => !missingImages[image.id]);

  if (!visibleImages.length) {
    return (
      <Card className="p-3 md:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d1d5db]/80 bg-white/80 text-[#6b7280]">
            <Search size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-[#111827]">Built-in rule sheets</h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Add the rule sheet images to <span className="font-mono">public/rules</span> to show them here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[#111827]">Rule sheets</h2>
            <p className="text-sm text-[#6b7280]">Tap a sheet to zoom and pan.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visibleImages.map((image) => (
            <button
              key={image.id}
              type="button"
              className="group overflow-hidden rounded-xl border border-[#d1d5db]/80 bg-white text-left shadow-[0_10px_24px_rgba(148,163,184,0.12)] transition hover:border-[#9ca3af]"
              onClick={() => setPreview(image)}
            >
              <img
                src={image.url}
                alt={image.title}
                className="aspect-[3/4] w-full bg-[#f8fafc] object-cover object-top"
                onError={() => setMissingImages((current) => ({ ...current, [image.id]: true }))}
              />
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <span className="truncate text-xs font-semibold text-[#374151] sm:text-sm">{image.title}</span>
                <Search size={15} className="shrink-0 text-[#6b7280] transition group-hover:text-[#111827]" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <RuleImageZoomModal image={preview} onClose={() => setPreview(null)} />
    </>
  );
};
