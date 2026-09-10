import React, { useState, useRef } from 'react';
import { Upload, Link2, Image as ImageIcon, Check, RefreshCw, X } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl: string;
  imageTitle?: string;
  onSelectUrl: (url: string, name?: string) => void;
  onClearImage?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentUrl, 
  imageTitle, 
  onSelectUrl,
  onClearImage 
}) => {
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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sua Imagem</span>
        </label>
        <span className="text-[10px] text-neutral-400">PNG, JPG, WebP</span>
      </div>

      {/* Se já houver imagem carregada, mostra cartão de status da imagem ativa */}
      {currentUrl && (
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
              <img
                src={currentUrl}
                alt="Imagem ativa"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-medium text-neutral-200 block truncate">
                {imageTitle || 'Imagem Carregada'}
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>Pronta para halftone</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Trocar por outra imagem"
              className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {onClearImage && (
              <button
                type="button"
                onClick={onClearImage}
                title="Remover imagem"
                className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
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
            {currentUrl ? 'Clique para trocar ou solte uma nova imagem' : 'Clique para escolher ou arraste a imagem'}
          </span>
          <span className="text-[10px] text-neutral-500">
            Carrega diretamente do seu computador sem limite
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
              placeholder="Ou cole o link de uma imagem (URL)..."
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
    </div>
  );
};
