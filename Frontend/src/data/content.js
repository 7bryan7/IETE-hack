export const FACTS = [
  'MotionForge is a browser-based, webcam-controlled 2.5D motor-practice playground.',
  'Core Loop: Learn → Move → Play → Get feedback → Improve.',
  '100% Privacy: All computer vision runs locally in your browser. No webcam video or frames are ever stored or transmitted.',
  'Pinch to Grab: Simply bring your thumb and index finger together to pick up virtual balls and blocks.',
  'Smart Hysteresis: MotionForge uses dual grab & release thresholds to prevent objects from flickering or dropping prematurely.',
  'Hand-Eye Coordination: The playground helps children and adults practice mapping hand gestures to 2.5D virtual objects.',
  'Universal Mouse Fallback: If camera access is unavailable or lighting is low, you can switch seamlessly to mouse or touch controls.',
  'Movement Efficiency: We compare your actual movement path against the direct path to measure fine motor coordination.',
  'Transparent Feedback: All scores and metrics are encouraging gameplay achievements, not diagnostic or clinical labels.',
  'Missions with Purpose: Practice sequential actions and spatial planning by placing the red ball into the basket.',
  'Left & Right Awareness: The tracking adapter mirrors your movements intuitively and works with either hand.',
  'Built with Care by Team Bug Eaters for the IETE Hackathon 2026 in Healthcare & Assistive Technology.',
  'Offline Ready: Your practice history and personal bests stay safe in your browser on your device.',
  'Short Grace Period: A 200ms grace window preserves your grab during brief tracking loss so you never lose control.',
  'Free Exploration: Complete missions at your own pace or freely interact with all toys and objects across the room.',
];

export const EXPLORE_LINKS = [
  { label: '2.5D Playroom Environment', href: '#playroom' },
  { label: 'Red Ball & Basket Mission', href: '#mission' },
  { label: 'Thumb-Index Pinch Gesture', href: '#tracking' },
  { label: 'Tracking Smoothing & Grace Window', href: '#smoothing' },
  { label: 'Universal Mouse & Touch Fallback', href: '#fallback' },
  { label: 'Live HUD & Continuous Metrics', href: '#metrics' },
  { label: 'Local-Only History (IndexedDB)', href: '#history' },
  { label: 'Game Score Reward Formula', href: '#score' },
];

export const ASSISTIVE_TECH_LINKS = [
  { label: 'Hand-Eye Coordination Practice', href: '#skills' },
  { label: 'Movement Accuracy & Control', href: '#accuracy' },
  { label: 'Spatial Planning & Sequential Goals', href: '#planning' },
  { label: 'Left/Right Hand Motor Awareness', href: '#awareness' },
  { label: 'Healthcare & Assistive Tech Domain', href: '#domain' },
  { label: 'Team Bug Eaters — IETE Hackathon 2026', href: '#team' },
];

export const SLIDES = [
  {
    id: 'c-home-section-12',
    label: 'Playroom',
    eyebrow: '2.5D Environment',
    title: 'Interactive Playroom',
    content: 'A persistent 2.5D motor playground. Select, grab, move, and place objects like balls, blocks, baskets, and stars.',
    cta: { label: 'Explore Playground', href: '#playroom' },
    buttonClass: 'u-bg-green',
    contentClass: 'u-bg-green',
    ctaClass: '-green-light',
    image: 'assets/home_carousel_green.svg',
    imageDark: 'assets/home_carousel_green_d.svg',
    background: '#02AE90',
    foreground: '#029C82',
    drops: [
      { style: { bottom: '15%', right: '25%', width: '90px' }, front: false },
      { style: { bottom: '5%', right: '45%', width: '45px' }, front: true },
      { style: { top: '25%', right: '32%', width: '40px' }, front: true },
      { style: { top: '28%', right: '25%', width: '26px' }, front: true },
    ],
  },
  {
    id: 'c-home-section-14',
    label: 'Tracking',
    eyebrow: 'Webcam & Gestures',
    title: 'Camera Hand Control',
    content: 'Move your hand in front of your webcam. Natural thumb-to-index pinch grabs objects, backed by our universal mouse fallback.',
    cta: { label: 'Tracking Controls', href: '#tracking' },
    buttonClass: 'u-bg-red',
    contentClass: 'u-bg-red',
    ctaClass: '-red-light',
    image: 'assets/home_carousel_red.svg',
    imageDark: 'assets/home_carousel_red_d.svg',
    background: '#FF7673',
    foreground: '#FA6562',
    drops: [
      { style: { bottom: '15%', right: '25%', width: '110px' }, front: false },
      { style: { bottom: '5%', right: '45%', width: '45px' }, front: true },
      { style: { top: '15%', right: '40%', width: '60px' }, front: true },
      { style: { top: '10%', right: '50%', width: '26px' }, front: true },
    ],
  },
  {
    id: 'c-home-section-16',
    label: 'Feedback',
    eyebrow: 'Continuous Metrics',
    title: 'Performance & Progress',
    content: 'Real-time feedback on movement efficiency, action accuracy, elapsed time, and errors. 100% private and stored locally.',
    cta: { label: 'View Metrics', href: '#feedback' },
    buttonClass: 'u-bg-yellow',
    contentClass: 'u-bg-yellow',
    ctaClass: '-yellow-light',
    image: 'assets/home_carousel_yellow.svg',
    imageDark: 'assets/home_carousel_yellow_d.svg',
    background: '#EFB700',
    foreground: '#EA9F0E',
    drops: [
      { style: { bottom: '12%', right: '18%', width: '70px' }, front: false, dark: true },
      { style: { top: '30%', left: '3%', width: '55px' }, front: false, dark: true },
      { style: { top: '25%', right: '32%', width: '40px' }, front: true, dark: true },
      { style: { top: '28%', right: '25%', width: '26px' }, front: true, dark: true },
    ],
  },
];

export const HERO_DROPS = [
  { style: { top: '15%', left: '15%', width: '60px' }, delay: '1.14s', rotate: '215deg' },
  { style: { top: '30%', left: '20%', width: '25px' }, delay: '2.62s', rotate: '-131deg' },
  { style: { top: '45%', left: '5%', width: '95px' }, delay: '2.84s', rotate: '-200deg' },
  { style: { top: '48%', right: '18%', width: '18px' }, delay: '1.77s', rotate: '-137deg' },
  { style: { top: '25%', right: '25%', width: '18px' }, delay: '1.17s', rotate: '-153deg' },
  { style: { top: '42%', right: '5%', width: '40px' }, delay: '1.77s', rotate: '-298deg' },
  { style: { top: '35%', right: '10%', width: '30px' }, delay: '1.83s', rotate: '96deg' },
];

export const VIDEO_EMBED_HTML = `
  <div style="background: #ffffff; border-radius: 28px; padding: 36px 28px; text-align: center; max-width: 540px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.12); color: #2A2B2A;">
    <div style="font-size: 48px; margin-bottom: 12px;">🖐️ ✨ 🎯</div>
    <h3 style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #EA9F0E; margin-bottom: 12px;">How MotionForge Works</h3>
    <p style="font-family: 'Zilla Slab', serif; font-size: 18px; line-height: 1.5; color: #555; margin-bottom: 20px;">
      MotionForge turns your ordinary webcam into an interactive motor-practice controller.
    </p>
    <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; font-size: 15px; background: #fff9f0; padding: 18px; border-radius: 18px;">
      <div><strong>1. Learn:</strong> Point your index finger to guide the glowing pointer across the playroom.</div>
      <div><strong>2. Grab:</strong> Pinch your thumb and index finger together to pick up balls, blocks, and stars.</div>
      <div><strong>3. Move & Place:</strong> Drag objects and release them inside targets like the toy basket.</div>
      <div><strong>4. Feedback:</strong> Watch your movement efficiency and accuracy improve on every trial!</div>
    </div>
    <div style="margin-top: 20px; font-size: 13px; color: #888;">
      🔒 100% In-Browser · No video is ever recorded or uploaded · Works with Mouse too
    </div>
  </div>
`;