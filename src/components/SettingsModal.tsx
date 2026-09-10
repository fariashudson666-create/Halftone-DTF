import React, { useState } from 'react';
import { X, Settings, Check, Sliders, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [printerModel, setPrinterModel] = useState<string>('ricoh-gen5');
  const [colorProfile, setColorProfile] = useState<string>('dtf-textile-v4');
  const [dpiSetting, setDpiSetting] = useState<string>('600');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#1b1b1f] border border-[#3b494b] rounded-lg w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-[#0d0e11] border-b border-[#3b494b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="text-[13px] font-headline font-bold text-[#dbfcff]">
              Studio Hardware &amp; RIP Calibration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-[10px] font-mono-tech">
          <div className="space-y-1">
            <label className="text-[#b9cacb]">Target DTF Printer Engine</label>
            <select
              value={printerModel}
              onChange={(e) => setPrinterModel(e.target.value)}
              className="w-full bg-[#0d0e11] border border-[#3b494b] rounded p-2 text-[#e3e2e6] focus:border-[#00f0ff] focus:outline-none"
            >
              <option value="ricoh-gen5">Ricoh Gen5 Industrial Dual Head (330mm / 600mm)</option>
              <option value="epson-i3200">Epson i3200-A1 High-Precision Dual Head</option>
              <option value="epson-xp600">Epson XP600 Economy Roll Feed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#b9cacb]">ICC Color &amp; Film Profile</label>
            <select
              value={colorProfile}
              onChange={(e) => setColorProfile(e.target.value)}
              className="w-full bg-[#0d0e11] border border-[#3b494b] rounded p-2 text-[#e3e2e6] focus:border-[#00f0ff] focus:outline-none"
            >
              <option value="dtf-textile-v4">DTF_Textile_HighVibrancy_v4.icc</option>
              <option value="apparel-natural">Apparel_NaturalTone_Underbase_v2.icc</option>
              <option value="sublimation-block">PolyDye_SubBlocker_Graphite.icc</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#b9cacb]">Resolution Pass Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {['300', '600', '1200'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDpiSetting(d)}
                  className={`py-1.5 rounded font-bold border transition-colors ${
                    dpiSetting === d
                      ? 'bg-[#00f0ff] text-[#00363a] border-[#00f0ff]'
                      : 'bg-[#0d0e11] border-[#3b494b] text-[#b9cacb] hover:text-[#e3e2e6]'
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-[#0d0e11] border-t border-[#3b494b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] text-[10px] font-mono-tech font-bold transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
