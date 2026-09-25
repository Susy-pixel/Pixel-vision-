import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Scan, Layers, RefreshCw } from 'lucide-react';

interface PixelAnalysisAnimationProps {
  imageSrc: string;
  isComplete: boolean;
  isRetrying?: boolean;
  retryAttempt?: number;
  onAnimationComplete?: () => void;
}

const ROTATING_STATUS_MESSAGES = [
  'Initializing visual analysis...',
  'Scanning image pixels...',
  'Detecting objects & contours...',
  'Analyzing visual features & textures...',
  'Comparing semantic patterns...',
  'Estimating classification confidence...',
  'Generating final prediction...',
];

interface CellData {
  col: number;
  row: number;
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export const PixelAnalysisAnimation: React.FC<PixelAnalysisAnimationProps> = ({
  imageSrc,
  isComplete,
  isRetrying = false,
  retryAttempt = 1,
  onAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [gridMetrics, setGridMetrics] = useState({ cols: 40, rows: 30, total: 1200 });

  // Rotate status messages smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % ROTATING_STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Main Canvas Pixel Matrix Scanning Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      if (!isRunning) return;

      // 1. Calculate displayed dimensions strictly preserving aspect ratio (contain mode)
      const containerW = container.clientWidth || 700;
      const maxH = Math.min(500, Math.max(300, window.innerHeight * 0.55));
      const naturalAspect = (img.naturalWidth || 800) / (img.naturalHeight || 600);

      let renderW: number;
      let renderH: number;

      if (naturalAspect >= containerW / maxH) {
        // Landscape / wide image bound by width
        renderW = Math.floor(containerW);
        renderH = Math.floor(containerW / naturalAspect);
      } else {
        // Portrait / tall image bound by height
        renderH = Math.floor(maxH);
        renderW = Math.floor(maxH * naturalAspect);
      }

      // Ensure canvas matches exact image dimensions without letterbox distortion
      canvas.width = renderW;
      canvas.height = renderH;

      // 2. Mathematically calculated uniform rectangular grid
      // Choose cell size between 12px and 16px based on display size
      const targetCellSize = renderW < 440 ? 12 : 15;
      const cols = Math.max(24, Math.min(64, Math.round(renderW / targetCellSize)));
      const cellW = renderW / cols;
      const rows = Math.max(16, Math.min(64, Math.round(renderH / cellW)));
      const cellH = renderH / rows;

      setGridMetrics({ cols, rows, total: cols * rows });

      // 3. Offscreen canvas to sample exact pixel colors for every cell
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      const sampleCtx = sampleCanvas.getContext('2d');
      if (!sampleCtx) return;

      sampleCtx.drawImage(img, 0, 0, cols, rows);
      const sampleData = sampleCtx.getImageData(0, 0, cols, rows).data;

      // 4. Offscreen canvas caching the full-resolution image for final smooth restoration
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = renderW;
      fullCanvas.height = renderH;
      const fullCtx = fullCanvas.getContext('2d');
      if (fullCtx) {
        fullCtx.drawImage(img, 0, 0, renderW, renderH);
      }

      // 5. Pre-calculate fixed, mathematically aligned grid cells
      const cells: CellData[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4;
          cells.push({
            col: c,
            row: r,
            x: c * cellW, // Fixed exact column coordinate
            y: r * cellH, // Fixed exact row coordinate
            r: sampleData[idx],
            g: sampleData[idx + 1],
            b: sampleData[idx + 2],
          });
        }
      }

      // Animation parameters
      let startTime = performance.now();
      let transitionStart: number | null = null;
      let transitionDuration = 800; // ms for final restoration

      const render = (now: number) => {
        if (!isRunning) return;

        const elapsed = now - startTime;
        ctx.clearRect(0, 0, renderW, renderH);

        // Scan line movement from left to right (period of 2.2 seconds)
        const scanPeriod = 2200;
        const scanRatio = (elapsed % scanPeriod) / scanPeriod;
        // Smooth forward sweep with a brief return
        const scanX = scanRatio * renderW;

        // Transition handling when AI response arrives
        let isTransitioning = false;
        let transitionProgress = 0;

        if (isComplete) {
          if (transitionStart === null) {
            transitionStart = now;
          }
          const tElapsed = now - transitionStart;
          transitionProgress = Math.min(1, tElapsed / transitionDuration);
          isTransitioning = true;

          if (transitionProgress >= 1) {
            // Draw final full-res crisp image
            ctx.drawImage(fullCanvas, 0, 0, renderW, renderH);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
            return;
          }
        }

        // A. Draw base pixelated mosaic (exact mathematical cells)
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];

          // Calculate orderly scan proximity: distance from cell center to vertical laser scan line
          const cellCenterX = cell.x + cellW * 0.5;
          const distX = Math.abs(cellCenterX - scanX);
          const scanGlowRadius = cellW * 3.5;
          const proximity = Math.max(0, 1 - distX / scanGlowRadius);

          // Orderly cell illumination:
          // Before scan reaches: dimmed digital mosaic (alpha ~0.5)
          // At scan line: soft bright glow (alpha ~0.98, boosted brightness)
          // Behind scan line: resolved clear pixel (alpha ~0.85)
          const isScanned = cellCenterX < scanX;

          let baseAlpha = 0.5;
          if (isScanned) {
            baseAlpha = 0.88;
          }

          // Proximity boost when scan line sweeps over this cell
          const alpha = Math.min(1, baseAlpha + proximity * 0.45);

          // Slight brightness boost on active scan
          let red = cell.r;
          let green = cell.g;
          let blue = cell.b;

          if (proximity > 0.05) {
            const boost = proximity * 35;
            red = Math.min(255, red + boost);
            green = Math.min(255, green + boost * 1.1); // subtle electric tint
            blue = Math.min(255, blue + boost * 1.2);
          }

          // Render uniform square pixel cell
          ctx.fillStyle = `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${alpha})`;
          ctx.fillRect(cell.x, cell.y, cellW, cellH);

          // Subtle digital cell grid border
          if (proximity > 0.2 && transitionProgress < 0.6) {
            // Highlighted glowing border on currently scanned cells
            ctx.strokeStyle = `rgba(34, 211, 238, ${proximity * 0.85})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, cellW - 1, cellH - 1);
          } else {
            // Standard crisp, subtle digital grid lines
            const gridLineAlpha = (1 - transitionProgress) * 0.22;
            if (gridLineAlpha > 0.02) {
              ctx.strokeStyle = `rgba(6, 182, 212, ${gridLineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(cell.x + 0.25, cell.y + 0.25, cellW - 0.5, cellH - 0.5);
            }
          }
        }

        // B. Draw high-tech vertical glowing scanning laser beam
        if (!isTransitioning || transitionProgress < 0.8) {
          const scanAlpha = isTransitioning ? (1 - transitionProgress) : 1;

          // Outer soft cyan/purple glow aura
          const beamWidth = Math.max(20, cellW * 3);
          const beamGrad = ctx.createLinearGradient(scanX - beamWidth, 0, scanX + beamWidth, 0);
          beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          beamGrad.addColorStop(0.35, `rgba(34, 211, 238, ${0.4 * scanAlpha})`);
          beamGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.7 * scanAlpha})`);
          beamGrad.addColorStop(0.65, `rgba(34, 211, 238, ${0.4 * scanAlpha})`);
          beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.fillStyle = beamGrad;
          ctx.fillRect(scanX - beamWidth, 0, beamWidth * 2, renderH);

          // Core sharp razor laser line
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * scanAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(scanX, 0);
          ctx.lineTo(scanX, renderH);
          ctx.stroke();

          // Subtle cyan edge line
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.8 * scanAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(scanX - 1, 0);
          ctx.lineTo(scanX - 1, renderH);
          ctx.stroke();
        }

        // C. Smooth final cross-fade into high-resolution original image when complete
        if (isTransitioning) {
          ctx.globalAlpha = transitionProgress;
          ctx.drawImage(fullCanvas, 0, 0, renderW, renderH);
          ctx.globalAlpha = 1.0;

          // Subtle finishing pulse flare across the image
          const flareAlpha = Math.sin(transitionProgress * Math.PI) * 0.35;
          if (flareAlpha > 0) {
            const flareGrad = ctx.createLinearGradient(0, 0, renderW, renderH);
            flareGrad.addColorStop(0, `rgba(34, 211, 238, ${flareAlpha})`);
            flareGrad.addColorStop(1, `rgba(168, 85, 247, ${flareAlpha * 0.7})`);
            ctx.fillStyle = flareGrad;
            ctx.fillRect(0, 0, renderW, renderH);
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
    };

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageSrc, isComplete, onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden bg-[#040814] border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col items-center justify-center p-3 sm:p-5"
    >
      {/* Mathematical Canvas Element (Maintains aspect ratio perfectly without letterboxing) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#030610]">
        <canvas
          ref={canvasRef}
          className="block mx-auto max-w-full max-h-[500px] object-contain shadow-inner"
        />

        {/* Top-Left HUD Badge: Precise Pixel Grid Telemetry */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#050b1a]/85 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-bold tracking-wider text-[11px]">DIGITAL PIXEL MATRIX</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] text-slate-300">
            {gridMetrics.cols} × {gridMetrics.rows} ({gridMetrics.total} CELLS)
          </span>
        </div>

        {/* Corner Geometrical Frame Reticles */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-10" />
      </div>

      {/* Bottom Status Ticker Bar */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#060d21]/90 backdrop-blur-lg border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            {isRetrying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Cpu className="w-4 h-4 animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-xs font-mono font-semibold text-cyan-300 tracking-wide transition-all duration-300">
              {isRetrying
                ? `AI service is temporarily busy... Retrying analysis (Attempt ${retryAttempt} of 4)...`
                : ROTATING_STATUS_MESSAGES[statusIndex]}
            </p>
            <p className="text-[11px] text-slate-400">
              {isRetrying
                ? 'Applying exponential backoff to handle server capacity...'
                : 'Progressive visual scanning across aligned digital pixel matrix...'}
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full sm:w-48 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full animate-pulse ${
              isRetrying
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
