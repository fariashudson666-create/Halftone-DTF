import React, { useState, useRef } from 'react';
import { Upload, Link2, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleArtworks';

interface ImageUploaderProps {
  currentUrl: string;
  onSelectUrl: (url: string, name?: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentUrl, onSelectUrl }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    // Testar carregamento básico da imagem
    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';
    testImg.src = cleanUrl;
    testImg.onload = () => {
      setUrlError(null);
      onSelectUrl(cleanUrl, 'imagem_link.png');
      setUrlInput('');
    };
    testImg.onerror = () => {
      // Tentar mesmo assim caso seja bloqueado apenas pelo teste
      onSelectUrl(cleanUrl, 'imagem_link.png');
      setUrlError(null);
      setUrlInput('');
    };
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSelectUrl(e.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sua Imagem</span>
        </label>
        <span className="text-[10px] text-neutral-400">PNG, JPG, WebP</span>
      </div>

      {/* Upload Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/60 hover:bg-neutral-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-cyan-400">
          <Upload className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-medium text-neutral-200 block">
            Clique para escolher ou arraste a imagem
          </span>
          <span className="text-[10px] text-neutral-500">
            Carrega instantaneamente do seu computador
          </span>
        </div>
      </div>

      {/* Input para colar URL direta */}
      <form onSubmit={handleApplyUrl} className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Link2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="url"
              placeholder="Cole o link da imagem (URL direta)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 border border-neutral-700 rounded-lg transition-colors shrink-0"
          >
            Carregar
          </button>
        </div>
        {urlError && <p className="text-[10px] text-rose-400">{urlError}</p>}
      </form>

      {/* Amostras Rápidas com 1 clique */}
      <div className="pt-1">
        <div className="flex items-center gap-1 mb-1.5 text-[10px] text-neutral-400 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Ou teste com imagens de exemplo:</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SAMPLE_IMAGES.map((img) => {
            const isSelected = currentUrl === img.url;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelectUrl(img.url, img.title)}
                title={img.title}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-all group ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <img
                  src={img.thumbnail}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  crossOrigin="anonymous"
                />
                <span className="absolute inset-x-0 bottom-0 py-0.5 px-1 bg-black/80 text-[8px] text-neutral-300 truncate text-center block">
                  {img.title}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
