
import React from 'react';
import type { AspectRatio, StylePreset } from '../App';

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Square' },
  { value: '3:4', label: 'Portrait' },
  { value: '16:9', label: 'Landscape' },
];

const STYLE_PRESETS: { value: StylePreset; label: string }[] = [
  { value: 'Default', label: 'Default' },
  { value: 'Vibrant', label: 'Vibrant' },
  { value: 'Minimalist', label: 'Minimalist' },
  { value: 'Cinematic', label: 'Cinematic' },
];

interface OptionButtonProps {
  label: string;
  value: string;
  selectedValue: string;
  onChange: (value: any) => void;
  disabled: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, value, selectedValue, onChange, disabled }) => (
  <button
    onClick={() => onChange(value)}
    disabled={disabled}
    className={`
      px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex-grow text-center
      ${selectedValue === value
        ? 'bg-purple-600 text-white'
        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {label}
  </button>
);

interface ShotIdeasDisplayProps {
  ideas: string[];
  disabled: boolean;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  stylePreset: StylePreset;
  onStylePresetChange: (style: StylePreset) => void;
}

const ShotIdeasDisplay: React.FC<ShotIdeasDisplayProps> = ({
  ideas,
  disabled,
  aspectRatio,
  onAspectRatioChange,
  stylePreset,
  onStylePresetChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {ideas.map((idea, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 flex items-start space-x-3"
          >
            <span className="text-purple-400 font-bold text-sm flex-shrink-0">{index + 1}.</span>
            <p className="text-sm text-gray-200">{idea}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-700 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Aspect Ratio</h3>
          <div className="flex items-center space-x-2">
            {ASPECT_RATIOS.map(ratio => (
              <OptionButton
                key={ratio.value}
                label={ratio.label}
                value={ratio.value}
                selectedValue={aspectRatio}
                onChange={onAspectRatioChange}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Style Preset</h3>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map(style => (
              <OptionButton
                key={style.value}
                label={style.label}
                value={style.value}
                selectedValue={stylePreset}
                onChange={onStylePresetChange}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotIdeasDisplay;
