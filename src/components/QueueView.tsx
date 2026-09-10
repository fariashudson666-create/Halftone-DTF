import React, { useState } from 'react';
import { PrintQueueItem, ArtworkSpec } from '../types';
import { 
  Play, 
  Pause, 
  Trash2, 
  Printer, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight 
} from 'lucide-react';

interface QueueViewProps {
  currentArtwork: ArtworkSpec;
  onNavigateToWorkspace: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  currentArtwork,
  onNavigateToWorkspace
}) => {
  const [queue, setQueue] = useState<PrintQueueItem[]>([
    {
      id: 'job-1042',
      jobName: 'BATCH_SKULL_LPI55',
      artworkTitle: currentArtwork.title,
      thumbnailUrl: currentArtwork.url,
      status: 'printing',
      copies: 12,
      widthMm: 320,
      heightMm: 440,
      lpi: 55,
      choke: -2,
      estimatedInkMl: 75.6,
      createdAt: '10:42 AM'
    },
    {
      id: 'job-1043',
      jobName: 'GANG_CYBER_ONI_x8',
      artworkTitle: 'Neo-Tokyo Cyber Oni Mask',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
      status: 'ready',
      copies: 8,
      widthMm: 300,
      heightMm: 420,
      lpi: 65,
      choke: -2,
      estimatedInkMl: 50.4,
      createdAt: '11:15 AM'
    },
    {
      id: 'job-1044',
      jobName: 'SPEEDWAY_TIGER_CHEST',
      artworkTitle: 'Speedway Tiger Emblem Club',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
      status: 'ready',
      copies: 20,
      widthMm: 280,
      heightMm: 380,
      lpi: 55,
      choke: -1.5,
      estimatedInkMl: 110.0,
      createdAt: '11:30 AM'
    }
  ]);

  const [isQueuePaused, setIsQueuePaused] = useState<boolean>(false);

  const handleAddCurrentJob = () => {
    const newItem: PrintQueueItem = {
      id: `job-${Math.floor(1000 + Math.random() * 9000)}`,
      jobName: `GANG_${currentArtwork.fileName.substring(0, 8).toUpperCase()}_${Date.now().toString().slice(-4)}`,
      artworkTitle: currentArtwork.title,
      thumbnailUrl: currentArtwork.url,
      status: 'ready',
      copies: 5,
      widthMm: currentArtwork.widthMm,
      heightMm: currentArtwork.heightMm,
      lpi: 55,
      choke: -2,
      estimatedInkMl: 31.5,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setQueue([newItem, ...queue]);
  };

  const handleRemoveJob = (id: string) => {
    setQueue(queue.filter(j => j.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0e11] overflow-hidden select-none p-4 space-y-4">
      {/* Header & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 rounded bg-[#1b1b1f] border border-[#3b494b] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-tech text-[#849495] block">
              DTF ROLL FEED YARDAGE
            </span>
            <span className="text-[16px] font-mono-tech font-bold text-[#e3e2e6]">
              14.8 Meters
            </span>
          </div>
          <span className="w-3 h-3 rounded-full bg-green-400"></span>
        </div>

        <div className="p-3 rounded bg-[#1b1b1f] border border-[#3b494b]">
          <span className="text-[9px] font-mono-tech text-[#849495] block">
            EST. WHITE INK CONSUMPTION
          </span>
          <span className="text-[16px] font-mono-tech font-bold text-white">
            184.2 ml
          </span>
        </div>

        <div className="p-3 rounded bg-[#1b1b1f] border border-[#3b494b]">
          <span className="text-[9px] font-mono-tech text-[#849495] block">
            TPU ADHESIVE POWDER
          </span>
          <span className="text-[16px] font-mono-tech font-bold text-[#ffd799]">
            168.0 grams
          </span>
        </div>

        <div className="p-3 rounded bg-[#1b1b1f] border border-[#3b494b] flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono-tech text-[#849495] block">
              PRINT ENGINE SPOOLER
            </span>
            <span className="text-[12px] font-mono-tech font-bold text-[#00f0ff]">
              {isQueuePaused ? 'PAUSED' : 'ONLINE (Epson i3200)'}
            </span>
          </div>
          <button
            onClick={() => setIsQueuePaused(!isQueuePaused)}
            className={`p-2 rounded font-mono-tech text-[10px] transition-colors ${
              isQueuePaused
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-[#343538] text-[#ffd799] hover:bg-[#292a2d]'
            }`}
          >
            {isQueuePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Gang-Sheet Roll Preview Simulation */}
      <div className="p-3 rounded bg-[#1b1b1f] border border-[#3b494b] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono-tech">
          <span className="text-[#00f0ff] font-bold uppercase tracking-wider">
            Continuous Gang-Sheet Roll Layout (330mm PET Film)
          </span>
          <span className="text-[#849495]">Auto-Nesting Spacing: 12mm</span>
        </div>
        {/* Continuous roll representation */}
        <div className="h-20 rounded bg-[#0d0e11] border border-dashed border-[#3b494b] p-2 flex items-center space-x-3 overflow-x-auto">
          {queue.map((job) => (
            <div
              key={job.id}
              className="h-16 w-32 shrink-0 rounded bg-[#1f1f23] border border-[#00f0ff]/40 p-1 flex items-center space-x-2 relative overflow-hidden"
            >
              <img
                src={job.thumbnailUrl}
                alt={job.artworkTitle}
                className="w-12 h-14 object-cover rounded"
                crossOrigin="anonymous"
              />
              <div className="overflow-hidden text-[8px] font-mono-tech">
                <span className="block font-bold text-[#e3e2e6] truncate">{job.jobName}</span>
                <span className="text-[#00f0ff] block">x{job.copies} copies</span>
                <span className="text-[#ffd799] block">{job.lpi} LPI</span>
              </div>
              {job.status === 'printing' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-green-400 animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Queue Table */}
      <div className="flex-1 bg-[#1b1b1f] border border-[#3b494b] rounded flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 bg-[#0d0e11] border-b border-[#3b494b] flex items-center justify-between">
          <span className="text-[11px] font-mono-tech font-bold text-[#dbfcff]">
            Spooler Job Queue ({queue.length} items)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddCurrentJob}
              className="px-2.5 py-1 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] text-[10px] font-mono-tech font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Current Artwork to Queue</span>
            </button>
            <button
              onClick={onNavigateToWorkspace}
              className="px-2.5 py-1 rounded bg-[#292a2d] hover:bg-[#343538] text-[#b9cacb] text-[10px] font-mono-tech"
            >
              Back to Canvas
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left font-mono-tech text-[10px]">
            <thead className="bg-[#14161b] text-[#849495] uppercase text-[9px] border-b border-[#3b494b]">
              <tr>
                <th className="px-4 py-2">Job Identifier</th>
                <th className="px-4 py-2">Artwork Title</th>
                <th className="px-4 py-2">Copies</th>
                <th className="px-4 py-2">LPI / Choke</th>
                <th className="px-4 py-2">Ink Est.</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3b494b]/50">
              {queue.map((job) => (
                <tr key={job.id} className="hover:bg-[#1f1f23] transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#00f0ff]">
                    {job.jobName}
                  </td>
                  <td className="px-4 py-2.5 text-[#e3e2e6]">
                    {job.artworkTitle}
                  </td>
                  <td className="px-4 py-2.5 text-white">
                    {job.copies} pcs
                  </td>
                  <td className="px-4 py-2.5 text-[#ffd799]">
                    {job.lpi} LPI / {job.choke}px
                  </td>
                  <td className="px-4 py-2.5 text-[#b9cacb]">
                    {job.estimatedInkMl.toFixed(1)} ml
                  </td>
                  <td className="px-4 py-2.5">
                    {job.status === 'printing' ? (
                      <span className="px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-700/50 flex items-center space-x-1 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                        <span>PRINTING</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#292a2d] text-[#b9cacb] border border-[#3b494b] w-max">
                        QUEUED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleRemoveJob(job.id)}
                      className="p-1 rounded text-[#849495] hover:text-red-400 hover:bg-[#343538] transition-colors"
                      title="Remove job from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
