import React, { useMemo, useRef, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [missingImages, setMissingImages] = useState({});
  const touchStartX = useRef(null);

  const visibleImages = useMemo(
    () => BUILT_IN_RULE_IMAGES.filter((image) => !missingImages[image.id]),
    [missingImages],
  );
  const activeImage = visibleImages[Math.min(activeIndex, Math.max(visibleImages.length - 1, 0))];
  const positionLabel = visibleImages.length ? `${Math.min(activeIndex + 1, visibleImages.length)} / ${visibleImages.length}` : '';
  const goPrevious = () => setActiveIndex((current) => (current - 1 + visibleImages.length) % visibleImages.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % visibleImages.length);
  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || visibleImages.length < 2) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) {
      goPrevious();
    } else {
      goNext();
    }
  };

  if (!visibleImages.length) {
    return (
      <Card className="p-2.5 md:p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d1d5db]/80 bg-white/80 text-[#6b7280]">
            <Search size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-[#111827]">Built-in rule sheets</h2>
            <p className="mt-1 text-xs text-[#6b7280] md:text-sm">
              Add the rule sheet images to <span className="font-mono">public/rules</span> to show them here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-2.5 md:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-[#111827]">Rule sheets</h2>
            <p className="text-xs text-[#6b7280] md:text-sm">Swipe through sheets, then open to zoom.</p>
          </div>
          <span className="shrink-0 rounded-full border border-[#d1d5db]/80 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#6b7280]">
            {positionLabel}
          </span>
        </div>

        {activeImage ? (
          <div className="overflow-hidden rounded-lg border border-[#d1d5db]/80 bg-white shadow-[0_16px_34px_rgba(148,163,184,0.14)]">
            <button
              type="button"
              className="block w-full touch-pan-y bg-[#f8fafc]"
              onClick={() => setPreviewOpen(true)}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
              }}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="max-h-[76vh] w-full object-contain object-top"
                onError={() => setMissingImages((current) => ({ ...current, [activeImage.id]: true }))}
              />
            </button>
          </div>
        ) : null}
      </Card>

      <RuleImageZoomModal
        image={previewOpen ? activeImage : null}
        onClose={() => setPreviewOpen(false)}
        onPrevious={goPrevious}
        onNext={goNext}
        positionLabel={positionLabel}
      />
    </>
  );
};
