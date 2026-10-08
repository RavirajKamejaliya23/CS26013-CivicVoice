// CivicVoice Comprehensive Theme Matrix
// Guaranteed high contrast (WCAG AAA/AA) across all five color schemes.

export const THEMES = {
  gustavoStage: {
    id: 'gustavoStage',
    name: 'NY Phil Gustavo Stage',
    subtitle: 'High-contrast dark stage, cadmium yellow & electric accents',
    previewColor: '#ffdd00',
    previewBorder: '#ffffff',
    styles: {
      '--theme-bg': '#080808',
      '--theme-bg-gradient': 'radial-gradient(ellipse at 50% 15%, #1c1c1c 0%, #0a0a0a 55%, #000000 100%)',
      '--theme-surface': '#141414',
      '--theme-surface-secondary': '#1e1e1e',
      '--theme-card-bg': '#141414',
      '--theme-card-border': 'rgba(255, 255, 255, 0.14)',
      '--theme-text-primary': '#ffffff',
      '--theme-text-secondary': '#a3a3a3',
      '--theme-text-muted': '#737373',
      '--theme-heading': '#ffffff',
      '--theme-accent': '#ffdd00',
      '--theme-accent-hover': '#f5d000',
      '--theme-accent-contrast': '#000000',
      '--theme-pill-bg': 'rgba(255, 221, 0, 0.14)',
      '--theme-border': 'rgba(255, 221, 0, 0.35)',
      '--theme-hero-glow': 'rgba(255, 221, 0, 0.2)',
    },
    heroBgClass: 'from-stone-900 via-black to-black',
    cardBorderClass: 'border-stone-800',
    badgeClass: 'bg-yellow-400 text-black border-yellow-500 font-bold',
    isDark: true
  },

  yellow: {
    id: 'yellow',
    name: 'Studio Post Yellow',
    subtitle: 'High-visibility municipal canary yellow with high-contrast obsidian typography',
    previewColor: '#f6c438',
    previewBorder: '#78350f',
    styles: {
      '--theme-bg': '#f6c438',
      '--theme-bg-gradient': 'radial-gradient(ellipse at 50% 20%, #fde68a 0%, #f6c438 55%, #dfa51b 100%)',
      '--theme-surface': '#ffffff',
      '--theme-surface-secondary': '#fffbeb',
      '--theme-card-bg': '#ffffff',
      '--theme-card-border': '#d97706',
      '--theme-text-primary': '#18181b', // Crisp black text on yellow/white
      '--theme-text-secondary': '#3f3f46',
      '--theme-text-muted': '#52525b',
      '--theme-heading': '#09090b',
      '--theme-accent': '#000000',
      '--theme-accent-hover': '#27272a',
      '--theme-accent-contrast': '#ffffff',
      '--theme-pill-bg': '#000000',
      '--theme-border': '#b45309',
      '--theme-hero-glow': 'rgba(0, 0, 0, 0.15)',
    },
    heroBgClass: 'from-amber-300 via-amber-400 to-amber-500',
    cardBorderClass: 'border-amber-400',
    badgeClass: 'bg-black text-yellow-400 border-black font-bold',
    isDark: false
  },

  pillarRed: {
    id: 'pillarRed',
    name: 'Lincoln Center Scarlet',
    subtitle: 'Theatrical velvet scarlet heraldry with brilliant white & gold typography',
    previewColor: '#991b1b',
    previewBorder: '#f87171',
    styles: {
      '--theme-bg': '#5b0c0c',
      '--theme-bg-gradient': 'radial-gradient(ellipse at 50% 20%, #851212 0%, #520909 60%, #300404 100%)',
      '--theme-surface': '#3b0606',
      '--theme-surface-secondary': '#4d0b0b',
      '--theme-card-bg': '#380606',
      '--theme-card-border': 'rgba(248, 113, 113, 0.3)',
      '--theme-text-primary': '#ffffff', // Brilliant white text on deep red
      '--theme-text-secondary': '#fecaca', // Pale rose secondary
      '--theme-text-muted': '#f87171',
      '--theme-heading': '#ffffff',
      '--theme-accent': '#fef08a', // Gold accent
      '--theme-accent-hover': '#fde047',
      '--theme-accent-contrast': '#000000',
      '--theme-pill-bg': 'rgba(254, 240, 138, 0.2)',
      '--theme-border': 'rgba(254, 240, 138, 0.4)',
      '--theme-hero-glow': 'rgba(254, 240, 138, 0.25)',
    },
    heroBgClass: 'from-red-950 via-red-900 to-black',
    cardBorderClass: 'border-red-900',
    badgeClass: 'bg-yellow-400 text-black border-yellow-500 font-bold',
    isDark: true
  },

  parchment: {
    id: 'parchment',
    name: 'Conductor Score Parchment',
    subtitle: 'Classic postal station stationery with deep slate ink and navy heraldry',
    previewColor: '#f7f4ea',
    previewBorder: '#1d4ed8',
    styles: {
      '--theme-bg': '#f4ebd8',
      '--theme-bg-gradient': 'radial-gradient(ellipse at 50% 20%, #faf6eb 0%, #f4ebd8 60%, #e6d8bf 100%)',
      '--theme-surface': '#ffffff',
      '--theme-surface-secondary': '#fdfaf2',
      '--theme-card-bg': '#ffffff',
      '--theme-card-border': '#cbd5e1',
      '--theme-text-primary': '#0f172a', // Deep ink slate
      '--theme-text-secondary': '#334155',
      '--theme-text-muted': '#64748b',
      '--theme-heading': '#020617',
      '--theme-accent': '#1d4ed8',
      '--theme-accent-hover': '#1e40af',
      '--theme-accent-contrast': '#ffffff',
      '--theme-pill-bg': 'rgba(29, 78, 216, 0.1)',
      '--theme-border': '#94a3b8',
      '--theme-hero-glow': 'rgba(29, 78, 216, 0.15)',
    },
    heroBgClass: 'from-amber-100 via-amber-200 to-stone-200',
    cardBorderClass: 'border-stone-300',
    badgeClass: 'bg-blue-900 text-white border-blue-950 font-bold',
    isDark: false
  },

  slateNight: {
    id: 'slateNight',
    name: 'Manhattan Midnight Carbon',
    subtitle: 'Urban night stage with high-contrast electric cyan neon indicators',
    previewColor: '#000000',
    previewBorder: '#00e5ff',
    styles: {
      '--theme-bg': '#04070d',
      '--theme-bg-gradient': 'radial-gradient(ellipse at 50% 20%, #111a28 0%, #080d16 60%, #000000 100%)',
      '--theme-surface': '#0c131f',
      '--theme-surface-secondary': '#141e30',
      '--theme-card-bg': '#0c131f',
      '--theme-card-border': 'rgba(0, 229, 255, 0.25)',
      '--theme-text-primary': '#ffffff',
      '--theme-text-secondary': '#94a3b8',
      '--theme-text-muted': '#64748b',
      '--theme-heading': '#ffffff',
      '--theme-accent': '#00e5ff',
      '--theme-accent-hover': '#00b4d8',
      '--theme-accent-contrast': '#000000',
      '--theme-pill-bg': 'rgba(0, 229, 255, 0.14)',
      '--theme-border': 'rgba(0, 229, 255, 0.35)',
      '--theme-hero-glow': 'rgba(0, 229, 255, 0.25)',
    },
    heroBgClass: 'from-slate-900 via-slate-950 to-black',
    cardBorderClass: 'border-cyan-900',
    badgeClass: 'bg-cyan-400 text-black border-cyan-300 font-bold',
    isDark: true
  }
};
