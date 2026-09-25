import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { ImageMetadata } from '../types/index';
import { formatBytes, getAspectRatioString } from '../utils/imageUtils';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (meta: ImageMetadata) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop camera stream utility
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start camera stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let isSubscribed = true;
    setIsInitializing(true);
    setError(null);

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser environment.');
        }

        // Stop any previous tracks first
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isSubscribed) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsInitializing(false);
      } catch (err: any) {
        if (!isSubscribed) return;
        console.error('Camera access error:', err);
        setIsInitializing(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission was denied. Please allow camera permissions in your browser or upload an image file directly.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device was detected on your system.');
        } else {
          setError(err.message || 'Unable to start camera.');
        }
      }
    };

    initCamera();

    return () => {
      isSubscribed = false;
      stopStream();
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Compute approximate file size
    const byteLength = Math.round((dataUrl.length * 3) / 4);

    const metadata: ImageMetadata = {
      name: `camera_capture_${Date.now()}.jpg`,
      sizeFormatted: formatBytes(byteLength),
      sizeBytes: byteLength,
      type: 'image/jpeg',
      width: canvas.width,
      height: canvas.height,
      aspectRatio: getAspectRatioString(canvas.width, canvas.height),
      dataUrl: dataUrl,
    };

    stopStream();
    onPhotoCaptured(metadata);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040814]/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#091126] border border-blue-900/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Camera Capture</h3>
              <p className="text-xs text-slate-400">Capture an image to classify directly with AI</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-video sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-rose-200 mb-1">{error}</p>
              <p className="text-xs text-slate-400 mt-2">
                You can close this dialog and upload an image file instead.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-8 pointer-events-none border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />

                <div className="w-4 h-4 border-t border-l border-cyan-300 opacity-60" />
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-[#060c1d]/80 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-300">Accessing optical sensor...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-t border-blue-900/40 bg-[#060c1d]">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={Boolean(error) || isInitializing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Facing</span>
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={Boolean(error) || isInitializing}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-40 active:scale-95"
          >
            <div className="w-3 h-3 rounded-full bg-slate-950 animate-ping" />
            <span>Take Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
