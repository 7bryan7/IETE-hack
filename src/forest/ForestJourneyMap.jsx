import React from 'react';
import { X, Check, Sparkles, Lock, MapPin, Compass } from 'lucide-react';
import { forestLevels } from './forestLevels.js';

export default function ForestJourneyMap({ currentLevel, unlockedLevel = 1, onSelectLevel, onClose }) {
  return (
    <div className="forest-shade" onClick={onClose} role="dialog" aria-modal="true" aria-label="Forest Journey Map">
      <div className="forest-map-dialog forest-glass" onClick={e => e.stopPropagation()}>
        <div className="forest-map-header">
          <div className="forest-map-title">
            <Compass size={24} className="forest-compass-icon" />
            <div>
              <span className="forest-eyebrow">WHISPERING WOODS</span>
              <h2>Forest Journey Map</h2>
            </div>
          </div>
          <button className="forest-icon-button" aria-label="Close map" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="forest-map-subtitle">
          Select any unlocked woodland area to begin your adventure. Follow the winding path to the Grand Magic Tree!
        </p>

        <div className="forest-map-path">
          {forestLevels.map((lvl, index) => {
            const isCompleted = lvl.id <= unlockedLevel;
            const isCurrent = lvl.id === currentLevel;
            const isLocked = lvl.id > Math.max(unlockedLevel + 1, currentLevel);

            return (
              <div key={lvl.id} className="forest-map-node-container">
                {index > 0 && (
                  <div className={`forest-map-connector ${isCompleted || isCurrent ? 'active' : ''}`} />
                )}
                <button
                  type="button"
                  disabled={isLocked}
                  className={`forest-map-node ${isCurrent ? 'current' : isCompleted ? 'completed' : 'locked'}`}
                  onClick={() => {
                    if (!isLocked) {
                      onSelectLevel(lvl.id);
                      onClose();
                    }
                  }}
                  title={isLocked ? `Level ${lvl.id} is locked` : `Play Level ${lvl.id}: ${lvl.title}`}
                >
                  <div className="forest-map-node-icon">
                    {isCompleted ? <Check size={18} /> : isCurrent ? <Sparkles size={18} /> : isLocked ? <Lock size={16} /> : lvl.id}
                  </div>
                  <div className="forest-map-node-info">
                    <div className="forest-map-node-top">
                      <span className="forest-map-node-level">LEVEL {lvl.id}</span>
                      <span className="forest-map-node-status">
                        {isCompleted ? 'Completed ✅' : isCurrent ? 'Current ✨' : 'Locked 🔒'}
                      </span>
                    </div>
                    <strong className="forest-map-node-title">{lvl.icon} {lvl.title}</strong>
                    <span className="forest-map-node-area"><MapPin size={12} /> {lvl.area}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="forest-map-footer">
          <button className="forest-button primary" onClick={onClose}>
            Resume Adventure
          </button>
        </div>
      </div>
    </div>
  );
}
