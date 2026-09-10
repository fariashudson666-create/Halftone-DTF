/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HalftoneSettings } from './types';
import { ImageUploader } from './components/ImageUploader';
import { HalftoneControls } from './components/HalftoneControls';
import { HalftoneCanvas } from './components/HalftoneCanvas';
import { VectorStudioModal } from './components/VectorStudioModal';
import { Sparkles, Layers } from 'lucide-react';

const DEFAULT_SETTINGS: HalftoneSettings = {
  dotSize: 4.5, // Pontos finos e nítidos
  dotSpacing: 1.25, // Pontos um pouco separados, calibrados para impressão DTF
  shape: 'round',
  colorMode: 'original',
  angle: 45,
  contrast: 1.15,
  invert: false,
  transparentBg: false,
  dotColor: '#000000',
  bgColor: '#ffffff',
  removeBgColor: false,
  bgTargetColor: '#ffffff',
  bgTolerance: 20,
  upscaleFactor: 1,
  dtfSeparationMode: true,
  minDotThreshold: 0.02
};

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [imageTitle, setImageTitle] = useState<string>('');
  const [settings, setSettings] = useState<HalftoneSettings>(DEFAULT_SETTINGS);
  const [mobileTab, setMobileTab] = useState<'preview' | 'controls'>('preview');
  const [isVectorStudioOpen, setIsVectorStudioOpen] = useState<boolean>(false);

  const handleSelectUrl = (url: string, title?: string) => {
    setCurrentUrl(url);
    if (title) setImageTitle(title);
    setMobileTab('preview');
  };

  const handleClearImage = () => {
    setCurrentUrl('');
    setImageTitle('');
  };

  const handleUploadFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCurrentUrl(e.target.result as string);
        setImageTitle(file.name);
        setMobileTab('preview');
      }
    };
    reader.readAsDataURL(file);
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
                DTF & Vetorização
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block">
              Retículas fiéis para DTF têxtil, pontos separados e exportação vetorial SVG
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Atalho para Vetorizar no Topo */}
          {currentUrl && (
            <button
              type="button"
              onClick={() => setIsVectorStudioOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-purple-950/50 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transformar em Vetor (SVG)</span>
            </button>
          )}

          {/* Alternador Mobile (Apenas em telas pequenas) */}
          <div className="flex sm:hidden bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mobileTab === 'preview' ? 'bg-cyan-500 text-black font-semibold' : 'text-neutral-400'
              }`}
            >
              Visualizar
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('controls')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mobileTab === 'controls' ? 'bg-cyan-500 text-black font-semibold' : 'text-neutral-400'
              }`}
            >
              Ajustes
            </button>
          </div>
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
          <div className="p-4 space-y-5">
            {/* Bloco 1: Onde o usuário coloca a imagem */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 shadow-sm">
              <ImageUploader
                currentUrl={currentUrl}
                imageTitle={imageTitle}
                onSelectUrl={handleSelectUrl}
                onClearImage={currentUrl ? handleClearImage : undefined}
              />
            </div>

            {/* Bloco 2: Controles do efeito halftone */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 shadow-sm">
              <HalftoneControls
                settings={settings}
                onChange={handleUpdateSettings}
                onReset={handleResetSettings}
                onOpenVectorStudio={currentUrl ? () => setIsVectorStudioOpen(true) : undefined}
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
            onUploadImage={handleUploadFile}
            onOpenVectorStudio={currentUrl ? () => setIsVectorStudioOpen(true) : undefined}
          />
        </main>
      </div>

      {/* Modal de Vetorização para SVG */}
      <VectorStudioModal
        isOpen={isVectorStudioOpen}
        onClose={() => setIsVectorStudioOpen(false)}
        imageUrl={currentUrl}
        imageTitle={imageTitle}
        settings={settings}
      />
    </div>
  );
}
