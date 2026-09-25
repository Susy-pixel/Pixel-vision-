import { ClassificationModeId } from '../types/index';

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  suggestedMode: ClassificationModeId;
  description: string;
  badge: string;
  dataUrl: string;
  fileName: string;
}

// Generate clean, high-contrast SVG images with rich details that Gemini vision analyzes accurately
function createSvgDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'tiger',
    title: 'Bengal Tiger (Panthera tigris)',
    category: 'Animals',
    suggestedMode: 'animals',
    badge: 'Animal Class',
    description: 'Distinctive wild predator with vivid orange fur, dark vertical stripes, and feline head structure.',
    fileName: 'bengal_tiger_sample.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#143018"/>
            <stop offset="100%" stop-color="#0a1a0c"/>
          </linearGradient>
          <linearGradient id="tigerFur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff8c00"/>
            <stop offset="50%" stop-color="#e65c00"/>
            <stop offset="100%" stop-color="#cc4400"/>
          </linearGradient>
          <linearGradient id="eyeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffeb3b"/>
            <stop offset="100%" stop-color="#cddc39"/>
          </linearGradient>
        </defs>
        <!-- Background jungle foliage -->
        <rect width="800" height="600" fill="url(#bgGrad)"/>
        <path d="M0 600 L120 400 L200 600 Z" fill="#1b4d24" opacity="0.6"/>
        <path d="M600 600 L720 350 L800 600 Z" fill="#1b4d24" opacity="0.6"/>
        
        <!-- Tiger Head Base -->
        <ellipse cx="400" cy="330" rx="200" ry="190" fill="url(#tigerFur)"/>
        
        <!-- Ears -->
        <path d="M260 210 Q240 130 310 160 Z" fill="#b33600"/>
        <path d="M270 200 Q260 150 300 170 Z" fill="#fff" opacity="0.9"/>
        <path d="M540 210 Q560 130 490 160 Z" fill="#b33600"/>
        <path d="M530 200 Q540 150 500 170 Z" fill="#fff" opacity="0.9"/>

        <!-- White facial ruffs -->
        <path d="M210 330 Q230 420 310 440 Q250 380 210 330 Z" fill="#ffffff"/>
        <path d="M590 330 Q570 420 490 440 Q550 380 590 330 Z" fill="#ffffff"/>
        <ellipse cx="400" cy="410" rx="90" ry="70" fill="#ffffff"/>

        <!-- Black Tiger Stripes -->
        <!-- Forehead stripes -->
        <path d="M390 180 L410 180 L400 240 Z" fill="#111"/>
        <path d="M370 210 Q350 250 380 260" stroke="#111" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M430 210 Q450 250 420 260" stroke="#111" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M360 170 Q320 200 350 230" stroke="#111" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M440 170 Q480 200 450 230" stroke="#111" stroke-width="14" stroke-linecap="round" fill="none"/>
        
        <!-- Cheek stripes -->
        <path d="M230 300 Q310 320 280 340" stroke="#111" stroke-width="18" stroke-linecap="round" fill="none"/>
        <path d="M240 360 Q320 370 290 395" stroke="#111" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M570 300 Q490 320 520 340" stroke="#111" stroke-width="18" stroke-linecap="round" fill="none"/>
        <path d="M560 360 Q480 370 510 395" stroke="#111" stroke-width="16" stroke-linecap="round" fill="none"/>

        <!-- Eyes -->
        <ellipse cx="330" cy="300" rx="28" ry="20" fill="#ffffff"/>
        <ellipse cx="330" cy="300" rx="22" ry="16" fill="url(#eyeGrad)"/>
        <ellipse cx="330" cy="300" rx="10" ry="14" fill="#000000"/>
        <circle cx="325" cy="295" r="4" fill="#ffffff"/>

        <ellipse cx="470" cy="300" rx="28" ry="20" fill="#ffffff"/>
        <ellipse cx="470" cy="300" rx="22" ry="16" fill="url(#eyeGrad)"/>
        <ellipse cx="470" cy="300" rx="10" ry="14" fill="#000000"/>
        <circle cx="465" cy="295" r="4" fill="#ffffff"/>

        <!-- Nose and Muzzle -->
        <path d="M375 350 L425 350 L400 385 Z" fill="#e06666"/>
        <path d="M400 385 L400 420" stroke="#111" stroke-width="6"/>
        <path d="M400 420 Q360 440 340 415" stroke="#111" stroke-width="6" fill="none"/>
        <path d="M400 420 Q440 440 460 415" stroke="#111" stroke-width="6" fill="none"/>

        <!-- Whiskers -->
        <line x1="330" y1="410" x2="160" y2="400" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="330" y1="420" x2="150" y2="430" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="330" y1="430" x2="170" y2="455" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="470" y1="410" x2="640" y2="400" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="470" y1="420" x2="650" y2="430" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
        <line x1="470" y1="430" x2="630" y2="455" stroke="#ffffff" stroke-width="3" opacity="0.8"/>

        <!-- Text watermark for visual context -->
        <text x="400" y="550" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="4">PANTHERA TIGRIS • BENGAL TIGER</text>
      </svg>
    `),
  },
  {
    id: 'sports_car',
    title: 'Electric Sports Supercar',
    category: 'Vehicles',
    suggestedMode: 'vehicles',
    badge: 'Vehicle Class',
    description: 'Sleek aerodynamic high-performance electric sports car with gullwing doors and metallic finish.',
    fileName: 'supercar_vehicle_sample.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0c172e"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
          <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="40%" stop-color="#38bdf8"/>
            <stop offset="80%" stop-color="#0369a1"/>
          </linearGradient>
          <linearGradient id="wheelRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#skyGrad)"/>
        <!-- Asphalt track with neon reflection -->
        <rect y="440" width="800" height="160" fill="#090d16"/>
        <line x1="0" y1="440" x2="800" y2="440" stroke="#00f5ff" stroke-width="3" opacity="0.7"/>

        <!-- Car Chassis Shadow -->
        <ellipse cx="400" cy="465" rx="330" ry="24" fill="#000000" opacity="0.8"/>

        <!-- Car Body Silhouette -->
        <path d="M120 420 Q140 370 230 350 L340 300 Q460 280 570 340 L690 380 Q730 400 710 435 L650 435 Q630 370 550 370 Q470 370 450 435 L290 435 Q270 370 190 370 Q130 370 120 420 Z" fill="url(#carBody)"/>

        <!-- Cabin Greenhouse / Windshield -->
        <path d="M330 310 L440 290 Q520 290 560 345 L380 345 Z" fill="#0f172a" opacity="0.9"/>
        <path d="M340 315 L430 298 L385 340 Z" fill="#38bdf8" opacity="0.4"/>

        <!-- Headlights / LED Strip -->
        <polygon points="120,410 160,405 150,420 120,418" fill="#ffffff"/>
        <polygon points="120,410 160,405 150,420 120,418" fill="#38bdf8" opacity="0.8"/>
        <!-- Tail light -->
        <rect x="690" y="390" width="18" height="12" rx="4" fill="#ef4444"/>

        <!-- Front Wheel -->
        <circle cx="210" cy="435" r="54" fill="#0f172a"/>
        <circle cx="210" cy="435" r="42" fill="url(#wheelRim)"/>
        <circle cx="210" cy="435" r="18" fill="#0284c7"/>

        <!-- Rear Wheel -->
        <circle cx="570" cy="435" r="54" fill="#0f172a"/>
        <circle cx="570" cy="435" r="42" fill="url(#wheelRim)"/>
        <circle cx="570" cy="435" r="18" fill="#0284c7"/>

        <!-- Aero Spoiler -->
        <path d="M660 350 L710 340 L700 360 Z" fill="#0369a1"/>

        <text x="400" y="550" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="4">GT ELECTRIC HYPERCAR • VEHICLE</text>
      </svg>
    `),
  },
  {
    id: 'pizza',
    title: 'Wood-Fired Margherita Pizza',
    category: 'Food',
    suggestedMode: 'food',
    badge: 'Food Class',
    description: 'Fresh artisanal Italian pizza with charred blistered crust, melted buffalo mozzarella, tomato sauce, and basil.',
    fileName: 'margherita_pizza_sample.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stop-color="#df9d54"/>
            <stop offset="90%" stop-color="#b66a23"/>
            <stop offset="100%" stop-color="#592b04"/>
          </radialGradient>
          <radialGradient id="sauceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#e02f1a"/>
            <stop offset="85%" stop-color="#b01f0e"/>
            <stop offset="100%" stop-color="#801205"/>
          </radialGradient>
        </defs>
        <!-- Rustic Wooden Board Background -->
        <rect width="800" height="600" fill="#24140b"/>
        <line x1="0" y1="150" x2="800" y2="150" stroke="#180c06" stroke-width="4"/>
        <line x1="0" y1="350" x2="800" y2="350" stroke="#180c06" stroke-width="4"/>
        
        <!-- Pizza Board -->
        <circle cx="400" cy="300" r="240" fill="#3d2112" stroke="#4d2c18" stroke-width="12"/>

        <!-- Pizza Dough Crust -->
        <circle cx="400" cy="300" r="215" fill="url(#crustGrad)"/>

        <!-- Char blisters on crust -->
        <ellipse cx="250" cy="180" rx="14" ry="8" fill="#1c0f05"/>
        <ellipse cx="530" cy="200" rx="16" ry="10" fill="#1c0f05"/>
        <ellipse cx="580" cy="340" rx="18" ry="9" fill="#1c0f05"/>
        <ellipse cx="220" cy="350" rx="12" ry="7" fill="#1c0f05"/>
        <ellipse cx="360" cy="490" rx="20" ry="8" fill="#1c0f05"/>

        <!-- Rich Tomato Sauce Base -->
        <circle cx="400" cy="300" r="175" fill="url(#sauceGrad)"/>

        <!-- Melted Mozzarella Islands -->
        <ellipse cx="360" cy="260" rx="35" ry="25" fill="#fff9db"/>
        <ellipse cx="450" cy="270" rx="40" ry="30" fill="#fff9db"/>
        <ellipse cx="380" cy="350" rx="45" ry="30" fill="#fff9db"/>
        <ellipse cx="440" cy="360" rx="30" ry="25" fill="#fff9db"/>
        <ellipse cx="310" cy="320" rx="28" ry="20" fill="#fff9db"/>
        <ellipse cx="480" cy="320" rx="25" ry="20" fill="#fff9db"/>

        <!-- Fresh Green Basil Leaves -->
        <path d="M370 290 Q400 270 410 290 Q390 320 370 290 Z" fill="#22c55e"/>
        <path d="M430 310 Q450 280 470 300 Q450 340 430 310 Z" fill="#16a34a"/>
        <path d="M340 370 Q370 350 380 380 Q350 400 340 370 Z" fill="#15803d"/>
        <path d="M460 380 Q480 350 500 370 Q480 410 460 380 Z" fill="#22c55e"/>

        <text x="400" y="565" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="4">MARGHERITA PIZZA • FOOD</text>
      </svg>
    `),
  },
  {
    id: 'monstera',
    title: 'Monstera Deliciosa Houseplant',
    category: 'Plants',
    suggestedMode: 'plants',
    badge: 'Botanical Class',
    description: 'Iconic Swiss cheese plant leaf with natural fenestrations, glossy emerald green foliage in a ceramic planter.',
    fileName: 'monstera_deliciosa_sample.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="50%" stop-color="#16a34a"/>
            <stop offset="100%" stop-color="#14532d"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#wallGrad)"/>

        <!-- Ceramic Pot -->
        <polygon points="340,430 460,430 440,530 360,530" fill="#e2e8f0"/>
        <ellipse cx="400" cy="430" rx="60" ry="12" fill="#cbd5e1"/>
        <ellipse cx="400" cy="430" rx="55" ry="10" fill="#3e2723"/>

        <!-- Main Plant Stems -->
        <path d="M400 430 Q410 320 400 180" stroke="#15803d" stroke-width="14" fill="none"/>
        <path d="M400 340 Q330 290 280 230" stroke="#15803d" stroke-width="10" fill="none"/>
        <path d="M400 320 Q480 270 530 220" stroke="#15803d" stroke-width="10" fill="none"/>

        <!-- Center Giant Monstera Leaf -->
        <path d="M400 130 C490 150 520 280 400 360 C280 280 310 150 400 130 Z" fill="url(#leafGrad)"/>
        
        <!-- Fenestrations (Holes) -->
        <ellipse cx="370" cy="220" rx="8" ry="24" fill="#0f172a" transform="rotate(-25 370 220)"/>
        <ellipse cx="430" cy="220" rx="8" ry="24" fill="#0f172a" transform="rotate(25 430 220)"/>
        <ellipse cx="360" cy="280" rx="9" ry="26" fill="#0f172a" transform="rotate(-35 360 280)"/>
        <ellipse cx="440" cy="280" rx="9" ry="26" fill="#0f172a" transform="rotate(35 440 280)"/>

        <!-- Cutout splits on edges -->
        <path d="M320 200 Q360 220 320 240 Z" fill="#0f172a"/>
        <path d="M480 200 Q440 220 480 240 Z" fill="#0f172a"/>
        <path d="M310 270 Q350 285 320 310 Z" fill="#0f172a"/>
        <path d="M490 270 Q450 285 480 310 Z" fill="#0f172a"/>

        <!-- Leaf Rib / Vein -->
        <path d="M400 130 L400 360" stroke="#86efac" stroke-width="4" opacity="0.8"/>

        <text x="400" y="570" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="4">MONSTERA DELICIOSA • BOTANICAL</text>
      </svg>
    `),
  },
  {
    id: 'chronograph',
    title: 'Vintage Chronograph Wristwatch',
    category: 'Everyday Objects',
    suggestedMode: 'everyday',
    badge: 'Object Class',
    description: 'Mechanical luxury wristwatch with stainless steel case, tachymeter bezel, sub-dials, and leather strap.',
    fileName: 'mechanical_watch_sample.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="steelBezel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#94a3b8"/>
            <stop offset="70%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </linearGradient>
          <linearGradient id="leatherStrap" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#451a03"/>
            <stop offset="50%" stop-color="#78350f"/>
            <stop offset="100%" stop-color="#451a03"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#090d16"/>

        <!-- Top Strap -->
        <rect x="340" y="40" width="120" height="150" rx="8" fill="url(#leatherStrap)"/>
        <!-- Bottom Strap -->
        <rect x="340" y="410" width="120" height="150" rx="8" fill="url(#leatherStrap)"/>

        <!-- Watch Lugs -->
        <polygon points="325,180 340,110 360,110 345,180" fill="url(#steelBezel)"/>
        <polygon points="475,180 460,110 440,110 455,180" fill="url(#steelBezel)"/>
        <polygon points="325,420 340,490 360,490 345,420" fill="url(#steelBezel)"/>
        <polygon points="475,420 460,490 440,490 455,420" fill="url(#steelBezel)"/>

        <!-- Outer Case -->
        <circle cx="400" cy="300" r="160" fill="url(#steelBezel)"/>
        
        <!-- Pushers and Crown -->
        <rect x="555" y="285" width="24" height="30" rx="4" fill="#94a3b8"/>
        <rect x="545" y="220" width="18" height="20" rx="4" fill="#94a3b8"/>
        <rect x="545" y="360" width="18" height="20" rx="4" fill="#94a3b8"/>

        <!-- Tachymeter Bezel -->
        <circle cx="400" cy="300" r="135" fill="#020617" stroke="#38bdf8" stroke-width="2"/>

        <!-- Dial Face -->
        <circle cx="400" cy="300" r="115" fill="#0f172a"/>

        <!-- Sub-dials -->
        <circle cx="355" cy="300" r="24" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="445" cy="300" r="24" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="400" cy="345" r="24" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>

        <!-- Hour Markers -->
        <rect x="396" y="190" width="8" height="18" fill="#ffffff"/>
        <rect x="396" y="392" width="8" height="18" fill="#ffffff"/>
        <rect x="290" y="296" width="18" height="8" fill="#ffffff"/>
        <rect x="492" y="296" width="18" height="8" fill="#ffffff"/>

        <!-- Watch Hands -->
        <!-- Hour Hand -->
        <line x1="400" y1="300" x2="360" y2="240" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
        <!-- Minute Hand -->
        <line x1="400" y1="300" x2="430" y2="215" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <!-- Chrono Second Hand -->
        <line x1="400" y1="330" x2="400" y2="195" stroke="#ef4444" stroke-width="2.5"/>
        <circle cx="400" cy="300" r="6" fill="#ef4444"/>

        <text x="400" y="580" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="4">CHRONOGRAPH WATCH • OBJECT</text>
      </svg>
    `),
  },
  {
    id: 'multi_subject',
    title: 'Park Scene (Golden Retriever & Bicycle)',
    category: 'Multiple Subjects',
    suggestedMode: 'general',
    badge: 'Multi-Entity',
    description: 'Demonstrates multi-object recognition: prominent dog in foreground alongside a commuter bicycle in a park.',
    fileName: 'dog_and_bicycle_scene.png',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <defs>
          <linearGradient id="parkBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#155e75"/>
            <stop offset="50%" stop-color="#0e7490"/>
            <stop offset="100%" stop-color="#166534"/>
          </linearGradient>
          <linearGradient id="dogFur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#ca8a04"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#parkBg)"/>
        <!-- Park Lawn -->
        <rect y="400" width="800" height="200" fill="#14532d"/>

        <!-- Bicycle (Subject B - Background) -->
        <g opacity="0.95" transform="translate(420, 260) scale(0.9)">
          <!-- Wheels -->
          <circle cx="60" cy="140" r="50" fill="none" stroke="#94a3b8" stroke-width="6"/>
          <circle cx="260" cy="140" r="50" fill="none" stroke="#94a3b8" stroke-width="6"/>
          <!-- Spokes -->
          <line x1="60" y1="90" x2="60" y2="190" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="10" y1="140" x2="110" y2="140" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="260" y1="90" x2="260" y2="190" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="210" y1="140" x2="310" y2="140" stroke="#cbd5e1" stroke-width="2"/>
          <!-- Frame -->
          <polygon points="60,140 160,140 230,70 130,70" fill="none" stroke="#06b6d4" stroke-width="8"/>
          <line x1="60" y1="140" x2="130" y2="70" stroke="#06b6d4" stroke-width="8"/>
          <line x1="160" y1="140" x2="120" y2="50" stroke="#06b6d4" stroke-width="8"/>
          <!-- Seat -->
          <polygon points="100,50 140,50 120,60" fill="#1e293b"/>
          <!-- Handlebars -->
          <line x1="230" y1="70" x2="250" y2="40" stroke="#94a3b8" stroke-width="8"/>
          <path d="M240 40 L260 40 L260 55" stroke="#1e293b" stroke-width="6" fill="none"/>
        </g>

        <!-- Golden Retriever Dog (Subject A - Foreground) -->
        <g transform="translate(140, 250)">
          <!-- Body -->
          <ellipse cx="140" cy="180" rx="90" ry="60" fill="url(#dogFur)"/>
          <!-- Hind leg -->
          <ellipse cx="80" cy="210" rx="40" ry="30" fill="#ca8a04"/>
          <!-- Front leg -->
          <rect x="180" y="190" width="28" height="70" rx="14" fill="url(#dogFur)"/>
          <rect x="210" y="190" width="26" height="70" rx="13" fill="#ca8a04"/>
          <!-- Tail -->
          <path d="M50 170 Q10 130 30 110" stroke="#eab308" stroke-width="22" stroke-linecap="round" fill="none"/>
          <!-- Neck & Head -->
          <path d="M200 160 L240 90 L290 100 L260 170 Z" fill="url(#dogFur)"/>
          <ellipse cx="270" cy="90" rx="35" ry="30" fill="url(#dogFur)"/>
          <!-- Muzzle -->
          <ellipse cx="305" cy="100" rx="22" ry="18" fill="#fef08a"/>
          <!-- Black Nose -->
          <ellipse cx="320" cy="95" rx="8" ry="6" fill="#0f172a"/>
          <!-- Drooping Ear -->
          <path d="M250 80 Q230 130 260 145 Z" fill="#ca8a04"/>
          <!-- Eye -->
          <circle cx="280" cy="82" r="6" fill="#0f172a"/>
          <circle cx="278" cy="80" r="2" fill="#ffffff"/>
          <!-- Red Collar -->
          <path d="M225 145 L255 130" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
        </g>

        <text x="400" y="570" font-family="sans-serif" font-weight="bold" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="3">MULTIPLE SUBJECTS: DOG &amp; BICYCLE</text>
      </svg>
    `),
  },
];
