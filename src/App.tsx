/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HalftoneSettings } from './types';
import { SAMPLE_IMAGES } from './data/sampleArtworks';
import { ImageUploader } from './components/ImageUploader';
import { HalftoneControls } from './components/HalftoneControls';
import { HalftoneCanvas } from './components/HalftoneCanvas';
import { Sparkles, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

const DEFAULT_SETTINGS: HalftoneSettings = {
  dotSize: 9,
  shape: 'round',
  colorMode: 'original',
  angle: 45,
  contrast: 1.2,
  invert: false,
  transparentBg: false,
  dotColor: '#000000',
  bgColor: '#ffffff',
  removeBgColor: false,
  bgTargetColor: '#ffffff',
  bgTolerance: 20,
  upscaleFactor: 1
};

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string>(SAMPLE_IMAGES[0].url);
  const [imageTitle, setImageTitle] = useState<string>(SAMPLE_IMAGES[0].title);
  const [settings, setSettings] = useState<HalftoneSettings>(DEFAULT_SETTINGS);
  const [mobileTab, setMobileTab] = useState<'preview' | 'controls'>('preview');

  const handleSelectUrl = (url: string, title?: string) => {
    setCurrentUrl(url);
    if (title) setImageTitle(title);
  };

  const handleUpdateSettings = (newSettings: Partial<HalftoneSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden font-sans">
      {/* Barra de Título Superior Limpa */}
      <header className="h-13 px-4 sm:px-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Halftone Studio</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Efeito de Retícula
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block">
              Coloque sua imagem, ajuste o efeito halftone e baixe pronta em PNG
            </p>
          </div>
        </div>

        {/* Alternador Mobile (Apenas em telas pequenas) */}
        <div className="flex sm:hidden bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              mobileTab === 'preview' ? 'bg-cyan-500 text-black' : 'text-neutral-400'
            }`}
          >
            Visualizar
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('controls')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              mobileTab === 'controls' ? 'bg-cyan-500 text-black' : 'text-neutral-400'
            }`}
          >
            Ajustes
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel Lateral: Imagem e Ajustes do Halftone */}
        <aside
          className={`w-full sm:w-80 md:w-96 bg-neutral-900 border-r border-neutral-800 flex flex-col overflow-y-auto shrink-0 z-20 ${
            mobileTab === 'controls' ? 'block' : 'hidden sm:flex'
          }`}
        >
          <div className="p-4 space-y-6">
            {/* Bloco 1: Onde o usuário coloca a imagem */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 shadow-sm">
              <ImageUploader
                currentUrl={currentUrl}
                onSelectUrl={handleSelectUrl}
              />
            </div>

            {/* Bloco 2: Apenas os controles do efeito halftone */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 shadow-sm">
              <HalftoneControls
                settings={settings}
                onChange={handleUpdateSettings}
                onReset={handleResetSettings}
              />
            </div>
          </div>
        </aside>

        {/* Visualizador Central e Download */}
        <main
          className={`flex-1 flex flex-col overflow-hidden ${
            mobileTab === 'preview' ? 'flex' : 'hidden sm:flex'
          }`}
        >
          <HalftoneCanvas
            imageUrl={currentUrl}
            imageTitle={imageTitle}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        </main>
      </div>
    </div>
  );
}
