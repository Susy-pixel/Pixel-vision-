import React from 'react';
import { Layers, Cat, UtensilsCrossed, Car, Flower2, Box, Check } from 'lucide-react';
import { ClassificationMode, ClassificationModeId } from '../types/index';

interface ModeSelectorProps {
  selectedMode: ClassificationModeId;
  onSelectMode: (mode: ClassificationModeId) => void;
  disabled?: boolean;
}

export const CLASSIFICATION_MODES: ClassificationMode[] = [
  {
    id: 'general',
    name: 'General Recognition',
    tagline: 'Multi-domain detection',
    description: 'Broad object classification across all everyday entities and scenes.',
    iconName: 'Layers',
    exampleCategories: ['People', 'Architecture', 'Landscapes', 'Multiple Entities'],
  },
  {
    id: 'animals',
    name: 'Animals & Wildlife',
    tagline: 'Fauna taxonomy',
    description: 'Mammals, birds, reptiles, marine life, and insects with species-level precision.',
    iconName: 'Cat',
    exampleCategories: ['Mammals', 'Birds', 'Reptiles', 'Invertebrates'],
  },
  {
    id: 'food',
    name: 'Food & Culinary',
    tagline: 'Gastronomy & dishes',
    description: 'Gourmet dishes, bakery, produce, beverages, and regional cuisines.',
    iconName: 'UtensilsCrossed',
    exampleCategories: ['Prepared Dishes', 'Pastries', 'Produce', 'Beverages'],
  },
  {
    id: 'vehicles',
    name: 'Vehicles & Transport',
    tagline: 'Automotive & transit',
    description: 'Automobiles, commercial transport, aerospace, watercraft, and motorcycles.',
    iconName: 'Car',
    exampleCategories: ['Sports Cars', 'Aviation', 'Motorcycles', 'Trains'],
  },
  {
    id: 'plants',
    name: 'Plants & Flora',
    tagline: 'Botanical identification',
    description: 'Houseplants, flowers, arboriculture, fungi, and foliage identification.',
    iconName: 'Flower2',
    exampleCategories: ['Houseplants', 'Wildflowers', 'Trees', 'Fungi'],
  },
  {
    id: 'everyday',
    name: 'Everyday Objects',
    tagline: 'Tools & appliances',
    description: 'Consumer goods, electronics, furniture, tools, accessories, and hardware.',
    iconName: 'Box',
    exampleCategories: ['Electronics', 'Timepieces', 'Tools', 'Home Goods'],
  },
];

export const ClassificationModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false,
}) => {
  const getIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`;
    switch (iconName) {
      case 'Layers':
        return <Layers className={iconClass} />;
      case 'Cat':
        return <Cat className={iconClass} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className={iconClass} />;
      case 'Car':
        return <Car className={iconClass} />;
      case 'Flower2':
        return <Flower2 className={iconClass} />;
      case 'Box':
        return <Box className={iconClass} />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Target Classification Mode
          </h3>
          <p className="text-xs text-slate-400">
            AI enforces strict categorization bounds and flags out-of-mode subjects
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/20 text-cyan-300">
          6 Modes Available
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {CLASSIFICATION_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`group relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0f1d3d] to-[#0a142c] border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                  : 'bg-[#091124]/60 border-slate-800/80 hover:bg-[#0c1733] hover:border-slate-700'
              }`}
            >
              {/* Check indicator if selected */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[#060b18]">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div className="mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                    isSelected ? 'bg-cyan-500/15 border border-cyan-500/30' : 'bg-slate-800/50'
                  }`}
                >
                  {getIcon(mode.iconName, isSelected)}
                </div>
                <div className="font-bold text-xs text-slate-100 group-hover:text-white leading-tight">
                  {mode.name}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug line-clamp-1">
                {mode.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
