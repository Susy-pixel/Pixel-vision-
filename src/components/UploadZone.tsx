import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Sparkles, AlertTriangle, FileWarning, ArrowUpRight } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, validateAndInspectImage, formatBytes, MAX_FILE_SIZE_BYTES } from '../utils/imageUtils';
import { ImageMetadata } from '../types/index';

interface UploadZoneProps {
  onImageSelected: (meta: ImageMetadata, warning?: string) => void;
  onOpenSamples: () => void;
  onOpenCamera: () => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onImageSelected,
  onOpenSamples,
  onOpenCamera,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          setErrorMessage('Failed to read image file.');
          setIsProcessing(false);
          return;
        }

        const qualityCheck = await validateAndInspectImage(file, dataUrl);

        if (!qualityCheck.isValid) {
          setErrorMessage(qualityCheck.errorMessage || 'Invalid image file.');
          setIsProcessing(false);
          return;
        }

        const metadata: ImageMetadata = {
          name: file.name,
          sizeFormatted: formatBytes(file.size),
          sizeBytes: file.size,
          type: file.type || 'image/jpeg',
          width: qualityCheck.width,
          height: qualityCheck.height,
          aspectRatio: qualityCheck.aspectRatio,
          dataUrl: dataUrl,
        };

        setIsProcessing(false);
        onImageSelected(
          metadata,
          qualityCheck.hasQualityWarning ? qualityCheck.qualityWarningMessage : undefined
        );
      };

      reader.onerror = () => {
        setErrorMessage('Failed to load image. The file may be unreadable.');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error processing selected image.');
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-2xl shadow-cyan-500/20'
            : 'border-blue-900/40 bg-gradient-to-b from-[#091228]/80 to-[#060c1d]/90 hover:border-cyan-500/50 hover:bg-[#0c1836]/90 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isProcessing}
        />

        {/* Ambient background glow behind upload icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-900/60 to-cyan-900/40 border border-cyan-500/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-blue-950">
            <UploadCloud className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
            Drop your image here
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mb-4 max-w-md">
            or <span className="text-cyan-400 font-semibold underline underline-offset-4 group-hover:text-cyan-300">click to browse</span> from your device
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-[#09152e]/80 border border-slate-800/80 px-4 py-2 rounded-xl">
            <span>Supported: JPG, PNG, WEBP</span>
            <span className="text-slate-600">•</span>
            <span>Max: {formatBytes(MAX_FILE_SIZE_BYTES)}</span>
          </div>

          <p className="text-xs text-slate-500 mt-4 italic font-medium">
            Your image is waiting.
          </p>
        </div>
      </div>

      {/* Alternative actions: Camera & Sample images */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#091124]/60 border border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Quick alternatives:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenCamera}
            disabled={disabled}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Use Camera</span>
          </button>

          <button
            type="button"
            onClick={onOpenSamples}
            disabled={disabled}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-900/40 to-violet-900/40 border border-blue-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Try Sample Images</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm animate-fadeIn">
          <FileWarning className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Validation Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
