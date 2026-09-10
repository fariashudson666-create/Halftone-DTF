/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ViewTab, 
  ViewMode, 
  GarmentColor, 
  ArtworkSpec, 
  RipSettings, 
  ChannelLayer, 
  ProductionPreset 
} from './types';
import { SAMPLE_ARTWORKS } from './data/sampleArtworks';
import { INITIAL_RIP_SETTINGS, INITIAL_CHANNELS, PRODUCTION_PRESETS } from './data/presets';
import { TopNavBar } from './components/TopNavBar';
import { LeftChannelsRail } from './components/LeftChannelsRail';
import { CenterCanvasStage } from './components/CenterCanvasStage';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { DirectImageLinkModal } from './components/DirectImageLinkModal';
import { ChokeMatrixModal } from './components/ChokeMatrixModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { ChannelsView } from './components/ChannelsView';
import { PresetsView } from './components/PresetsView';
import { QueueView } from './components/QueueView';

export default function App() {
  // Navigation & View Modes
  const [currentTab, setCurrentTab] = useState<ViewTab>('workspace');
  const [viewMode, setViewMode] = useState<ViewMode>('composite');
  const [garmentColor, setGarmentColor] = useState<GarmentColor>('black');

  // Active Artwork & Direct Image Link
  const [currentArtwork, setCurrentArtwork] = useState<ArtworkSpec>(SAMPLE_ARTWORKS[0]);

  // RIP Engine Settings
  const [ripSettings, setRipSettings] = useState<RipSettings>(INITIAL_RIP_SETTINGS);
  const [channels, setChannels] = useState<ChannelLayer[]>(INITIAL_CHANNELS);

  // Tools State
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [pipetteDensity, setPipetteDensity] = useState<number>(84.2);
  const [isPipetteActive, setIsPipetteActive] = useState<boolean>(false);

  // Modals
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isChokeMatrixOpen, setIsChokeMatrixOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Channel toggles
  const handleToggleChannel = (id: string) => {
    setChannels(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, visible: !ch.visible } : ch))
    );
  };

  const handleAddSpotChannel = () => {
    const newCh: ChannelLayer = {
      id: `spot-${Date.now()}`,
      name: 'Custom Foil / Spot Mask',
      shortName: 'SPOT',
      colorHex: '#38bdf8',
      angle: 30.0,
      dotShape: '30° Round',
      visible: true,
      solid: 'Spot Varnish',
      density: 50
    };
    setChannels([...channels, newCh]);
  };

  // Change RIP settings
  const handleChangeSettings = (newSettings: Partial<RipSettings>) => {
    setRipSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Apply production preset
  const handleApplyPreset = (preset: ProductionPreset) => {
    setRipSettings(prev => ({
      ...prev,
      currentPresetId: preset.id,
      lpi: preset.lpi,
      dotShape: preset.dotShape,
      underbaseChoke: preset.underbaseChoke,
      underbaseMode: preset.underbaseMode,
      minimumDotCutoff: preset.minimumCutoff,
      doublePass: preset.doublePass
    }));
  };

  return (
    <div className="h-screen w-screen bg-[#121316] text-[#e3e2e6] flex flex-col overflow-hidden select-none font-body-text">
      {/* Top Application Bar */}
      <TopNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        garmentColor={garmentColor}
        onSelectGarmentColor={setGarmentColor}
        currentArtwork={currentArtwork}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {currentTab === 'workspace' && (
          <>
            {/* Left Channel Isolation Rail */}
            <LeftChannelsRail
              channels={channels}
              onToggleChannel={handleToggleChannel}
              pipetteDensity={pipetteDensity}
              isPipetteActive={isPipetteActive}
              onTogglePipette={() => setIsPipetteActive(!isPipetteActive)}
              highlightChoke={ripSettings.underbaseChoke}
              onOpenChokeMatrix={() => setIsChokeMatrixOpen(true)}
              showRulers={showRulers}
              onToggleRulers={() => setShowRulers(!showRulers)}
              onAddSpotChannel={handleAddSpotChannel}
            />

            {/* Center Canvas Stage */}
            <CenterCanvasStage
              currentArtwork={currentArtwork}
              ripSettings={ripSettings}
              viewMode={viewMode}
              garmentColor={garmentColor}
              channels={channels}
              showRulers={showRulers}
              isPipetteActive={isPipetteActive}
              onPipetteSample={(val) => setPipetteDensity(val)}
              onOpenImageModal={() => setIsImageModalOpen(true)}
            />

            {/* Right Inspector & Parameter Studio */}
            <RightInspectorPanel
              ripSettings={ripSettings}
              onChangeSettings={handleChangeSettings}
              onApplyPreset={handleApplyPreset}
              onRenderPreview={() => {
                // Trigger re-render notification or micro-flash
                setRipSettings(r => ({ ...r, dotGainComp: r.dotGainComp }));
              }}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          </>
        )}

        {currentTab === 'channels' && (
          <ChannelsView
            channels={channels}
            onToggleChannel={handleToggleChannel}
            currentArtwork={currentArtwork}
            ripSettings={ripSettings}
          />
        )}

        {currentTab === 'presets' && (
          <PresetsView
            ripSettings={ripSettings}
            onApplyPreset={handleApplyPreset}
            onNavigateToWorkspace={() => setCurrentTab('workspace')}
          />
        )}

        {currentTab === 'queue' && (
          <QueueView
            currentArtwork={currentArtwork}
            onNavigateToWorkspace={() => setCurrentTab('workspace')}
          />
        )}
      </div>

      {/* Direct Image Links & HTML Modal */}
      <DirectImageLinkModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentArtwork={currentArtwork}
        onSelectArtwork={(art) => setCurrentArtwork(art)}
      />

      {/* Choke Matrix Micro-Adjustment Modal */}
      <ChokeMatrixModal
        isOpen={isChokeMatrixOpen}
        onClose={() => setIsChokeMatrixOpen(false)}
        underbaseChoke={ripSettings.underbaseChoke}
        onChangeChoke={(val) => handleChangeSettings({ underbaseChoke: val })}
      />

      {/* Production Package & TIFF Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentArtwork={currentArtwork}
        ripSettings={ripSettings}
      />

      {/* Studio Calibration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
