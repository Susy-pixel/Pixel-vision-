import React from 'react';
import {
  Brain,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Network,
  Cpu,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#091228] to-[#070d1e] border border-blue-900/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-4">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture &amp; Reliability Framework</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Demystifying Neural Vision &amp; Classification
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            PixelVision AI combines high-resolution visual feature encoders with Google's state-of-the-art Gemini 3.8 multimodal models to provide explainable, rigorous image classification without forced hallucinations.
          </p>
        </div>
      </div>

      {/* Grid of Core Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic 1: What is Image Classification? */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            What is Image Classification?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Image classification is a fundamental computer vision task in which an algorithmic model assigns one or more semantic categories (such as <em>"Bengal Tiger"</em> or <em>"Margherita Pizza"</em>) to an input photograph. Unlike simple object detection which draws bounding boxes, classification evaluates the entire visual context, texture distributions, and foreground subjects to determine what is depicted.
          </p>
        </div>

        {/* Topic 2: How AI Analyzes Images */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
            <Binary className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            How Neural Vision Deconstructs Pixels
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            An image is ingested as raw numerical matrices representing red, green, and blue (RGB) color values. Hierarchical neural layers apply spatial convolution filters and self-attention tokens: early layers discern edges, angles, and color gradients; mid-level layers compose textures and geometries; high-level transformer layers recognize organic shapes, species markings, and semantic objects.
          </p>
        </div>

        {/* Topic 3: What Neural Networks Are */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2">
            <Network className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Deep Neural Networks &amp; Vision Transformers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Modern vision models, including Gemini multimodal transformers, process image patches analogously to text tokens. By projecting image patches into dense multi-dimensional vector spaces, the model captures non-local relationships across the entire image simultaneously, enabling nuanced recognition even when subjects are partially angled or cropped.
          </p>
        </div>

        {/* Topic 4: Why Confidence is Probabilistic */}
        <div className="p-6 rounded-3xl bg-[#091126] border border-blue-900/30 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Why Confidence Scores are Probabilities, Not Guarantees
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Neural outputs are probabilistic softmax distributions over semantic space. A 94% score signifies that given the visible features, textures, and lighting patterns, the statistical likelihood of that class is 0.94. It is never an absolute guarantee of reality. Shadows, unusual perspectives, compression artifacts, and uncommon breeds can introduce variance.
          </p>
        </div>
      </div>

      {/* AI Safety & Reliability Section */}
      <div className="p-8 rounded-3xl bg-[#081228] border border-cyan-500/30 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Safety &amp; Uncertainty Guardrails</h2>
            <p className="text-xs text-slate-400">
              Zero forced hallucinations and principled uncertainty handling
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Standard image classification models often suffer from a critical flaw: when presented with an out-of-distribution image (such as an animal in a vehicle classifier), they blindly force the prediction into the closest mathematical label (e.g. classifying a Tiger as a "Cat" or a Car as a "Dog").
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#050a1a] border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1 text-xs sm:text-sm text-cyan-300">
                1. Mode Boundary Enforcement
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a user selects "Animals" or "Vehicles", images outside that domain are flagged as unsupported rather than mislabeled.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050a1a] border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1 text-xs sm:text-sm text-amber-300">
                2. Uncertainty Refusal
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an image is excessively blurred, dark, or lacks distinctive anatomical traits, the system declines to guess and explains the ambiguity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#050a1a] border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1 text-xs sm:text-sm text-violet-300">
                3. Grounded Visual Evidence
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every prediction is accompanied by 2–4 observable visual features directly visible in the image frame, preventing hallucinated rationales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
