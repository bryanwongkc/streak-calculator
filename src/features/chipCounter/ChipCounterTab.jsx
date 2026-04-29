import React, { useEffect, useRef, useState } from 'react';
import { ChipColorConfig } from './ChipColorConfig';
import { InitialStackEditor } from './InitialStackEditor';
import { CurrentStackEditor } from './CurrentStackEditor';
import { getSharedInitialCounts, isLegacyDefaultChipConfig } from './chipMath';
import { createDefaultChipConfig } from '../game/gameTypes';
import { useLocalChipCounts } from '../../hooks/useLocalChipCounts';

export const ChipCounterTab = ({ game, onUpdateGame, disabled }) => {
  const players = game.players || [];
  const rawChipConfig = game.chipConfig || createDefaultChipConfig();
  const shouldUpgradeLegacyDefaults = isLegacyDefaultChipConfig(rawChipConfig);
  const chipConfig = shouldUpgradeLegacyDefaults ? createDefaultChipConfig() : rawChipConfig;
  const colors = chipConfig.colors || [];
  const initialCounts = getSharedInitialCounts(chipConfig, players, colors);
  const [activeSection, setActiveSection] = useState('setup');
  const [currentCounts, setCurrentCounts] = useLocalChipCounts(game.id, colors);
  const upgradedLegacyDefaultsRef = useRef(false);

  useEffect(() => {
    if (shouldUpgradeLegacyDefaults && !upgradedLegacyDefaultsRef.current) {
      upgradedLegacyDefaultsRef.current = true;
      onUpdateGame({ chipConfig: createDefaultChipConfig() });
    }
  }, [onUpdateGame, shouldUpgradeLegacyDefaults]);

  const updateChipConfig = (patch) => {
    const { initialCountsByPlayer, ...baseChipConfig } = chipConfig;

    return onUpdateGame({
      chipConfig: {
        ...baseChipConfig,
        initialCounts,
        ...patch,
      },
    });
  };

  const handleColorsChange = (nextColors) => {
    updateChipConfig({
      colors: nextColors,
      initialCounts: getSharedInitialCounts({ ...chipConfig, initialCounts }, players, nextColors),
    });
  };

  const handleInitialCountChange = (colorId, value) => {
    updateChipConfig({
      initialCounts: {
        ...initialCounts,
        [colorId]: value,
      },
    });
  };

  const sections = [
    { id: 'setup', label: 'Chip Setup' },
    { id: 'starting', label: 'Starting Stack' },
    { id: 'current', label: 'Current Stack' },
  ];

  const sectionClass = (id) => (
    `${activeSection === id ? 'block' : 'hidden'} md:block`
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#d1d5db]/80 bg-white/90 p-1 md:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`min-h-10 rounded-lg px-2 text-xs font-semibold ${activeSection === section.id ? 'bg-[#111827] text-white' : 'text-[#6b7280]'}`}
          >
            {section.label.replace(' Stack', '')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
        <div className="space-y-3">
          <div className={sectionClass('setup')}>
            <ChipColorConfig colors={colors} onChange={handleColorsChange} disabled={disabled} />
          </div>
          <div className={sectionClass('starting')}>
            <InitialStackEditor
              colors={colors}
              initialCounts={initialCounts}
              onCountsChange={handleInitialCountChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className={sectionClass('current')}>
          <CurrentStackEditor
            colors={colors}
            initialCounts={initialCounts}
            currentCounts={currentCounts}
            onCurrentCountsChange={(colorId, value) => setCurrentCounts((prev) => ({ ...prev, [colorId]: value }))}
          />
        </div>
      </div>
    </div>
  );
};
