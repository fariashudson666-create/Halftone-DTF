import React, { useState } from 'react';
import { ArtworkSpec } from '../types';
import { SAMPLE_ARTWORKS } from '../data/sampleArtworks';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  UploadCloud, 
  Image as ImageIcon, 
  Code2, 
  Sparkles 
} from 'lucide-react';

interface DirectImageLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArtwork: ArtworkSpec;
  onSelectArtwork: (artwork: ArtworkSpec) => void;
}

export const DirectImageLinkModal: React.FC<DirectImageLinkModalProps> = ({
  isOpen,
  onClose,
  currentArtwork,
  onSelectArtwork
}) => {
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('Custom Graphic');
  const [copiedType, setCopiedType] = useState<'url' | 'html' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const htmlImgTag = `<img src="${currentArtwork.url}" alt="${currentArtwork.altText}" class="w-full h-auto object-cover" />`;

  const copyToClipboard = (text: string, type: 'url' | 'html') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    try {
      new URL(customUrl); // validation
    } catch {
      setErrorMsg('Please enter a valid URL (including https://)');
      return;
    }

    const newArt: ArtworkSpec = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim() || 'Custom Artwork',
      fileName: customUrl.split('/').pop()?.split('?')[0] || 'artwork_direct_url.png',
      url: customUrl.trim(),
      altText: 'Custom user provided direct image link',
      dpi: 300,
      widthMm: 320,
      heightMm: 440,
      pixelWidth: 3780,
      pixelHeight: 5196,
      category: 'Custom'
    };

    onSelectArtwork(newArt);
    setErrorMsg('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newArt: ArtworkSpec = {
      id: `upload-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      url: objectUrl,
      altText: `Uploaded file ${file.name}`,
      dpi: 300,
      widthMm: 320,
      heightMm: 440,
      pixelWidth: 3780,
      pixelHeight: 5196,
      category: 'Upload'
    };

    onSelectArtwork(newArt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in">
      <div className="bg-[#1b1b1f] border border-[#3b494b] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d0e11] border-b border-[#3b494b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-[13px] font-headline font-bold text-[#dbfcff]">
                Direct Image Links &amp; HTML Embeds
              </h2>
              <p className="text-[9px] font-mono-tech text-[#849495]">
                Sim! É possível adicionar e usar links diretos para as imagens do HTML
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Image Direct Link Box */}
          <div className="p-3 rounded bg-[#0d0e11] border border-[#3b494b] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-tech">
              <span className="text-[#00f0ff] font-bold uppercase tracking-wider flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 mr-1 text-[#00f0ff]" />
                Active Artwork Direct Link
              </span>
              <span className="text-[#849495]">{currentArtwork.fileName}</span>
            </div>

            {/* Direct URL input with copy */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentArtwork.url}
                className="flex-1 bg-[#1f1f23] border border-[#3b494b] rounded px-2.5 py-1.5 text-[10px] font-mono-tech text-[#b9cacb] select-all focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(currentArtwork.url, 'url')}
                className="px-3 py-1.5 rounded bg-[#292a2d] hover:bg-[#343538] border border-[#3b494b] text-[10px] font-mono-tech font-bold text-[#e3e2e6] flex items-center space-x-1 transition-colors"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#00f0ff]" />}
                <span>{copiedType === 'url' ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={currentArtwork.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded bg-[#292a2d] hover:bg-[#343538] border border-[#3b494b] text-[#b9cacb] hover:text-[#00f0ff] transition-colors"
                title="Open direct link in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Direct HTML <img> Tag */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[9px] font-mono-tech text-[#ffd799] flex items-center space-x-1">
                  <Code2 className="w-3 h-3 mr-1" />
                  HTML &lt;img&gt; Embed Code:
                </span>
                <button
                  onClick={() => copyToClipboard(htmlImgTag, 'html')}
                  className="text-[9px] font-mono-tech text-[#00f0ff] hover:underline flex items-center space-x-1"
                >
                  {copiedType === 'html' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'html' ? 'Copied Tag' : 'Copy <img> Tag'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-[#16171b] border border-[#3b494b] text-[9px] font-mono-tech text-[#a6e3a1] overflow-x-auto whitespace-pre-wrap break-all">
                {htmlImgTag}
              </pre>
            </div>
          </div>

          {/* Load from Any Direct URL Form */}
          <form onSubmit={handleLoadCustomUrl} className="p-3 rounded bg-[#1f1f23] border border-[#3b494b] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-tech font-bold text-[#dbfcff]">
              <span>Load Any Direct Image Link (URL)</span>
              <span className="text-[8px] text-[#ffd799] font-normal">PNG, JPG, WebP, SVG</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Artwork Title (e.g. Vintage Skull)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="bg-[#0d0e11] border border-[#3b494b] rounded px-2 py-1.5 text-[10px] font-mono-tech text-[#e3e2e6] focus:border-[#00f0ff] focus:outline-none"
              />
              <input
                type="url"
                placeholder="Paste direct image link: https://example.com/art.png"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setErrorMsg('');
                }}
                className="sm:col-span-2 bg-[#0d0e11] border border-[#3b494b] rounded px-2 py-1.5 text-[10px] font-mono-tech text-[#e3e2e6] focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-[9px] font-mono-tech text-red-400">{errorMsg}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              {/* File upload alternative */}
              <label className="flex items-center space-x-1 text-[10px] font-mono-tech text-[#b9cacb] hover:text-[#00f0ff] cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Or upload file from computer</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-3 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] font-mono-tech text-[10px] font-bold disabled:opacity-50 transition-all neon-cyan-glow"
              >
                Load Direct Image
              </button>
            </div>
          </form>

          {/* Sample Preset Artworks with Direct Links */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
              Curated Direct-Link Sample Artworks
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_ARTWORKS.map((art) => {
                const isSelected = currentArtwork.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => {
                      onSelectArtwork(art);
                      onClose();
                    }}
                    className={`p-2 rounded text-left border transition-all flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-[#343538] border-[#00f0ff] ring-1 ring-[#00f0ff]'
                        : 'bg-[#1f1f23] border-[#3b494b] hover:border-[#849495]'
                    }`}
                  >
                    <div className="w-full h-24 rounded bg-[#0d0e11] overflow-hidden relative">
                      <img
                        src={art.url}
                        alt={art.altText}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-mono-tech text-[#00f0ff]">
                        {art.dpi} DPI
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono-tech font-bold text-[#e3e2e6] truncate">
                        {art.title}
                      </span>
                      <span className="text-[8px] font-mono-tech text-[#849495] block truncate">
                        {art.widthMm}x{art.heightMm}mm
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0d0e11] border-t border-[#3b494b] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#292a2d] hover:bg-[#343538] text-[#e3e2e6] text-[10px] font-mono-tech transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
