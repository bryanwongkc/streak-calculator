import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
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
            <p className="text-sm text-[#6b7280]">Swipe through sheets, then open to zoom.</p>
          </div>
          <span className="shrink-0 rounded-full border border-[#d1d5db]/80 bg-white/80 px-3 py-1 text-xs font-semibold text-[#6b7280]">
            {positionLabel}
          </span>
        </div>

        {activeImage ? (
          <div className="overflow-hidden rounded-xl border border-[#d1d5db]/80 bg-white shadow-[0_16px_34px_rgba(148,163,184,0.14)]">
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
                className="max-h-[58vh] w-full object-contain object-top"
                onError={() => setMissingImages((current) => ({ ...current, [activeImage.id]: true }))}
              />
            </button>
            <div className="flex items-center justify-between gap-2 border-t border-[#e5e7eb] px-2 py-2">
              <Button aria-label="Previous rule sheet" size="icon" variant="ghost" onClick={goPrevious} icon={ChevronLeft} />
              <button
                type="button"
                className="min-w-0 flex-1 rounded-lg px-2 py-2 text-center text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6]"
                onClick={() => setPreviewOpen(true)}
              >
                <span className="mr-2">{activeImage.title}</span>
                <Maximize2 size={15} className="inline-block text-[#6b7280]" />
              </button>
              <Button aria-label="Next rule sheet" size="icon" variant="ghost" onClick={goNext} icon={ChevronRight} />
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleImages.map((image) => (
            <button
              key={image.id}
              type="button"
              className={`group w-20 shrink-0 overflow-hidden rounded-lg border bg-white text-left transition ${
                image.id === activeImage?.id
                  ? 'border-[#111827] shadow-[0_10px_24px_rgba(17,24,39,0.16)]'
                  : 'border-[#d1d5db]/80 hover:border-[#9ca3af]'
              }`}
              onClick={() => setActiveIndex(visibleImages.findIndex((item) => item.id === image.id))}
            >
              <img
                src={image.url}
                alt={image.title}
                className="aspect-[3/4] w-full bg-[#f8fafc] object-cover object-top"
                onError={() => setMissingImages((current) => ({ ...current, [image.id]: true }))}
              />
              <div className="flex items-center justify-center gap-1 px-1 py-1.5">
                <span className="text-[11px] font-semibold text-[#374151]">{visibleImages.findIndex((item) => item.id === image.id) + 1}</span>
                <Search size={12} className="shrink-0 text-[#6b7280] transition group-hover:text-[#111827]" />
              </div>
            </button>
          ))}
        </div>
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
