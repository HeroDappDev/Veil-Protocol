# ZK Oracle Network - Cyberpunk Terminal Design System

## Design Approach

**Theme:** Cyberpunk Terminal / Hacker Aesthetic with Solana Branding

Inspired by synaptax.net's terminal interface, combining futuristic cyberpunk aesthetics with Solana's iconic purple and mint green colors. The interface channels a high-tech command center where AI oracles and blockchain intersect.

**Core Principles:**
- Terminal/command-line aesthetic throughout
- Cyberpunk visual language (grids, scan lines, glows)
- Solana purple dominance with mint green accents
- Technical precision for blockchain data
- Real-time streaming data displays
- Immersive dark mode experience

## Color System

### Solana Brand Colors (Primary Palette)

**Purple (Primary):**
- `--solana-purple`: #9945FF (Solana brand purple)
- Used for: CTAs, highlights, active states, primary text accents
- Glow effects with purple hue

**Mint Green (Accent):**
- `--solana-mint`: #14F195 (Solana brand mint)
- Used for: Success states, terminal text, data highlights, live indicators
- Cyberpunk terminal green aesthetic

**Gradient Combinations:**
- Purple to mint: `linear-gradient(135deg, #9945FF, #14F195)`
- Used for: Borders, backgrounds, accent elements

### Dark Backgrounds

**Base Layers:**
- Background: `#0a0a0f` (Deep purple-black)
- Card background: `#12121a` (Slightly elevated purple-black)
- Panel background: `#1a1a24` (More elevated)
- Border: `rgba(153, 69, 255, 0.2)` (Purple with low opacity)

**Terminal Aesthetic:**
- Text: `#e0e0ff` (Soft purple-white)
- Muted text: `#8888aa` (Desaturated purple-gray)
- Terminal green text: `#14F195` (Solana mint)
- Code/monospace: `#14F195` (Mint green for terminal data)

### Semantic Colors

**Status Colors:**
- Success: `#14F195` (Solana mint green)
- Warning: `#ffaa00` (Amber)
- Error: `#ff4466` (Bright red)
- Info: `#6688ff` (Soft blue)

**Interactive States:**
- Hover: Add `rgba(153, 69, 255, 0.15)` glow
- Active: Brighter purple `#b366ff`
- Focus: Purple ring with glow effect

## Typography System

**Font Families:**
- Primary: Inter - Clean, modern for UI text
- Terminal: JetBrains Mono - ALL technical data, addresses, numbers, blockchain info
- Headings: Inter with letter-spacing for impact

**Cyberpunk Typography:**
- Headers use UPPERCASE with wide letter-spacing (tracking-wider)
- Terminal-style brackets: `[ SECTION_NAME ]`, `[ LIVE_DATA ]`
- Monospace for all data: addresses, hashes, metrics, timestamps
- Glowing text effects on key information

**Hierarchy:**
- Page Headers: text-3xl md:text-4xl, font-bold, uppercase, tracking-wider, text-solana-purple
- Section Headers: text-xl md:text-2xl, font-semibold, uppercase, text-mint
- Terminal Sections: `[ SECTION ]` format with mint green
- Card Titles: text-lg, font-medium, text-purple-200
- Body Text: text-base, text-gray-300
- Technical Data: text-sm, font-mono, text-mint
- Live Indicators: text-xs, uppercase, tracking-wide, text-mint

## Cyberpunk Visual Effects

### Grid Patterns
- Background grid overlays using CSS gradients
- Animated grid lines flowing across panels
- Matrix-style data streams

### Scan Lines
- Subtle horizontal scan line animation
- Adds retro terminal CRT effect
- Low opacity to not distract

### Glow Effects
- Purple glow on primary elements
- Mint green glow on data/metrics
- Text shadow glows: `text-shadow: 0 0 20px rgba(153, 69, 255, 0.8)`
- Box shadows with glow: `box-shadow: 0 0 40px rgba(153, 69, 255, 0.3)`

### Border Animations
- Animated gradient borders
- Pulsing glow on live data
- Terminal-style corner brackets

### Terminal Aesthetic
- Blinking cursor animations
- Typing effects for data streams
- Monospace layouts everywhere
- Command-line style inputs
- ASCII art dividers

## Layout System

### Terminal Grid Structure
- Full-width sections with terminal borders
- Grid-based data displays (like blockchain explorers)
- Live streaming event feeds
- Real-time metric panels

**Container System:**
- Full bleed dark backgrounds
- Inner containers: max-w-7xl mx-auto px-4 md:px-6
- Section spacing: py-12 md:py-20 for dramatic spacing
- Card padding: p-6 md:p-8 for generous breathing room

### Dashboard Layout
- Live metrics ticker at top
- Three-column grid for data panels
- Streaming event feed sidebar
- Terminal-style status cards
- Blockchain data tables

## Component Library

### Navigation Header
**Terminal Command Bar Style:**
- Full-width with backdrop blur and purple glow border
- Logo left with purple glow effect
- Navigation items in brackets: `[ HOME ]` `[ TERMINAL ]` `[ DASHBOARD ]`
- Wallet connection: Terminal-style address display
- Active state: Mint green underline with glow

### Hero Section (Landing)
**Cyberpunk Command Center:**
- Large heading with glowing purple gradient
- Animated grid background
- Live metrics ticker below hero
- Terminal-style data displays
- Flowing scan lines
- CTA buttons with purple/mint gradient glow

### Data Cards
**Terminal Panel Style:**
- Dark card background with purple border glow
- Header with brackets: `[ CARD_TITLE ]`
- Monospace data throughout
- Mint green for numbers/metrics
- Corner bracket decorations
- Hover: Intensified glow effect

### Live Metrics Display
**Real-time Data Stream:**
- Large monospace numbers
- Mint green color
- Animated counting effects
- Live pulse indicator
- Grid background
- Terminal-style labels: `TPS:`, `NODES:`, `GAS:`

### Status Indicators
- Live: Pulsing mint green dot
- Active: Solid mint green
- Processing: Rotating purple spinner
- Success: Mint green checkmark with glow
- Failed: Red X with glow

### Query Forms
**Terminal Input Style:**
- Dark input backgrounds
- Purple focus glow
- Monospace font
- Terminal cursor
- Command-line aesthetic
- Mint green submit buttons

### Blockchain Data Tables
**Terminal List View:**
- Monospace font throughout
- Alternating row backgrounds
- Purple row highlights on hover
- Mint green for addresses/hashes
- Live updating rows with animation
- Terminal-style borders

### Educational Tooltips
- Dark background with purple border
- Mint green icon triggers
- Monospace code examples
- Glowing effects
- Cyberpunk style brackets

## Animations

### Purposeful Cyberpunk Motion
- Grid line animations flowing
- Scan line scrolling
- Data stream typing effects
- Number counting animations
- Glow pulsing on live indicators
- Gradient border rotations
- Terminal cursor blinking

### Micro-interactions
- Button hover: Glow intensifies
- Card hover: Border glow + slight lift
- Input focus: Purple glow ring
- Loading: Rotating purple spinner
- Success: Mint green flash
- Status changes: Smooth color transitions

## Terminal-Specific Elements

### Bracket Decorations
Use liberally throughout:
```
[ SECTION_TITLE ]
> Data item
▸ Sub-item
• Bullet point
```

### Terminal Dividers
```
═══════════════════════════════════
─────────────────────────────────
>>> Live Feed
```

### ASCII Art
Use for visual separation and cyberpunk aesthetic:
```
╔═══════════════════════════════╗
║  TITLE HERE                   ║
╚═══════════════════════════════╝
```

### Data Display Patterns
```
METRIC_NAME:        1,234,567 units
STATUS:             ACTIVE
LAST_UPDATED:       2024-11-08 15:30:42 UTC
```

## Responsive Behavior

**Mobile Adaptations:**
- Maintain cyberpunk aesthetic on all screens
- Stack terminal panels vertically
- Reduce glow intensity on mobile for performance
- Collapse navigation to terminal-style menu
- Maintain monospace for all data
- Scale down ASCII art gracefully

**Breakpoints:**
- sm: 640px - Minimal layout adjustments
- md: 768px - Two-column layouts emerge
- lg: 1024px - Full three-column dashboard
- xl: 1280px - Maximum data density

## Accessibility

- Maintain WCAG AA contrast despite dark theme
- Purple/mint combinations tested for colorblind users
- High contrast mode: Increase text opacity
- Reduce animations on prefers-reduced-motion
- Clear focus indicators with purple glow
- Screen reader labels for all terminal symbols

## Solana Branding Integration

**Logo Treatment:**
- Solana logo with purple/mint gradient
- Glowing effect on hover
- Maintains brand recognition

**Color Ratios:**
- 70% Purple (dominant)
- 20% Mint Green (accents)
- 10% Neutral (backgrounds, text)

**Brand Voice:**
- Technical, precise, futuristic
- Cyberpunk terminology
- Blockchain-native language
- Command-line aesthetic

