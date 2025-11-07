# Design System - Auth-Agent

This document outlines the design system and visual guidelines for the Auth-Agent landing page. Follow these standards when creating new sections and components.

## Table of Contents

- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Animation & Motion](#animation--motion)
- [Patterns & Best Practices](#patterns--best-practices)

---

## Color System

### Primary Colors

The primary color is an orange/amber tone using OKLCH color space for better perceptual uniformity:

```css
--primary: oklch(0.706 0.195 44.5);
--primary-foreground: oklch(1 0 0); /* white */
```

### Background & Surfaces

- **Base Background**: `bg-gray-950` - Very dark background
- **Gradient/Overlay**: `bg-transparent` with borders for glass morphism effect

### Borders

Use specific border colors to create depth and hierarchy:

- **Primary Border**: `#321808` - Dark brown/bordeaux for accent borders
- **Secondary Border**: `border-zinc-800` - Neutral dark border
- **Transparent Borders**: `border-primary/40` - Primary color at 40% opacity
- **Input Borders**: `border-border` or `oklch(1 0 0 / 10%)` in dark mode

### Text Colors

Create hierarchy using zinc scale and white:

- **Primary Text**: `text-white` - Headers and important content
- **Secondary Text**: `text-zinc-200` - Subheadings
- **Tertiary Text**: `text-zinc-300` - Supporting text
- **Muted Text**: `text-zinc-400` - Less important information

### Usage Guidelines

- Use `bg-transparent` with borders for buttons and cards to maintain the glassmorphism aesthetic
- Apply `backdrop-blur-md` for overlays and navigation
- Prefer OKLCH colors for theme tokens (as defined in `index.css`)
- Use opacity modifiers (`/40`, `/60`) for subtle effects

---

## Typography

### Font Families

- **Sans-serif**: Geist (primary)
- **Monospace**: Geist Mono (code and technical content)

Both fonts are loaded from Google Fonts with CSS variables:

```tsx
--font-geist-sans
--font-geist-mono
```

### Type Scale

| Element | Classes | Usage |
|---------|---------|-------|
| Hero Title | `text-7xl font-bold tracking-tight` | Main hero headlines |
| Section Title | `text-4xl font-bold tracking-tight` | Section headers |
| Large Subheading | `text-2xl font-semibold tracking-tight` | Important subheadings |
| Medium Subheading | `text-xl font-semibold tracking-tight` | Secondary subheadings |
| Large Body | `text-lg font-normal leading-relaxed` | Emphasized body text |
| Body | `text-base font-normal` | Default body text |
| Small Text | `text-sm` | Captions and metadata |
| Micro Text | `text-xs uppercase` | Labels and tags |

### Typography Patterns

1. **Hero Headlines**: Always use `text-white`, `tracking-tight`, and center alignment
2. **Subheadings**: Use zinc colors (`text-zinc-200` to `text-zinc-400`) based on hierarchy
3. **Primary CTA Text**: `uppercase` with `font-semibold`
4. **Line Height**: Use `leading-relaxed` for better readability on large text blocks
5. **Text Alignment**: Center align hero content, left align body content by default

### Example Usage

```tsx
{/* Hero Title */}
<h1 className="text-white text-7xl tracking-tight font-bold text-center">
  Your Main Headline
</h1>

{/* Subheading */}
<p className="text-zinc-200 text-xl font-semibold leading-relaxed text-center tracking-tight">
  Supporting description
</p>

{/* Muted Text */}
<p className="text-zinc-400 text-base font-normal text-center">
  Additional details
</p>
```

---

## Spacing & Layout

### Container System

Use the `Container` component for consistent page width:

```tsx
<Container className="py-48">
  {/* content */}
</Container>
```

**Container Specifications**:
- Max width: `max-w-[80rem]` (1280px)
- Centered: `mx-auto`
- Full width: `w-full`
- Flex column: `flex flex-col items-center`

### Spacing Scale

Follow a consistent spacing pattern using Tailwind's default scale:

| Size | Class | Usage |
|------|-------|-------|
| Tiny | `gap-1` | Tightly grouped elements |
| Small | `gap-2` | Related items |
| Medium | `gap-4` | Component spacing |
| Large | `gap-6` | Section internal spacing |
| XL | `gap-8` | Major section divisions |

### Vertical Spacing

- **Hero Section**: `py-48` - Large vertical padding for hero sections
- **Navbar**: `py-6` - Standard navbar padding
- **Sections**: Use `gap-6` between major content blocks within a section

### Layout Patterns

1. **Full Screen Sections**: `w-full h-screen flex flex-col`
2. **Content Centering**: `flex flex-col gap-8 items-center`
3. **Horizontal Groups**: `flex items-center gap-8`
4. **Grid Layouts**: Use Tailwind's grid system with consistent gaps

### Responsive Considerations

- Use responsive variants: `text-base md:text-lg lg:text-2xl`
- Add horizontal padding on mobile: `max-w-4xl px-4`
- Maintain vertical rhythm across breakpoints

---

## Components

### Buttons

The button system uses transparent backgrounds with borders for a glassmorphism effect.

#### Variants

**Default (Primary)**
```tsx
<Button
  variant="default"
  size="lg"
  className="uppercase bg-primary text-black text-2xl font-semibold tracking-tight py-8"
>
  Get Started For Free
</Button>
```

Properties:
- Base: `bg-transparent border border-primary/40 text-white`
- Hover: `hover:bg-primary hover:text-primary-foreground`
- Override for solid primary: `bg-primary text-black`

**Secondary (Outline)**
```tsx
<Button
  variant="default"
  size="lg"
  className="text-2xl font-semibold tracking-tight py-8 hover:border-primary hover:text-primary hover:bg-transparent"
>
  View Documentation
</Button>
```

Properties:
- Maintains transparent background
- Hover state changes border and text color

**Ghost**
```tsx
<Button
  variant="ghost"
  className="bg-transparent hover:bg-transparent text-white hover:text-zinc-200"
>
  Sign In
</Button>
```

Properties:
- No visible border
- Subtle color change on hover

#### Button Best Practices

1. Use `uppercase` for primary CTAs
2. Use `tracking-tight` for better letter spacing
3. Apply `font-semibold` for emphasis
4. Large buttons: `size="lg"` with custom `py-8`
5. Maintain 75ms transitions: `duration-75 ease-linear`
6. Always specify hover states explicitly

### Navbar

The navbar uses a glassmorphism design with backdrop blur.

```tsx
<div className="w-full flex border-b border-[#321808] backdrop-blur-md z-20">
  <div className="py-6 mx-auto w-full max-w-[80rem] flex items-center justify-between border-b border-zinc-800">
    {/* content */}
  </div>
</div>
```

**Specifications**:
- Two-layer border: outer `border-[#321808]`, inner `border-zinc-800`
- Backdrop blur: `backdrop-blur-md`
- Fixed max-width: `max-w-[80rem]`
- Vertical padding: `py-6`
- Z-index: `z-20` for proper stacking

**Navigation Links**:
```tsx
<Link
  href="/path"
  className="text-white text-md transition-colors duration-75 ease-linear hover:text-zinc-200"
>
  Link Text
</Link>
```

### Container Component

Always use the Container component for consistent page width:

```tsx
import Container from "@/components/container";

<Container className="py-48">
  <div className="flex flex-col gap-8 items-center">
    {/* content */}
  </div>
</Container>
```

### Logo & Brand

```tsx
<Image
  src="/assets/logo.png"
  alt="auth-agent"
  width={32}
  height={32}
  className="h-6 w-auto"
/>
<h3 className="text-white font-semibold text-xl">auth-agent</h3>
```

**Brand Guidelines**:
- Logo height: `h-6`
- Logo width: automatic (`w-auto`)
- Brand name: lowercase, `text-xl font-semibold text-white`

---

## Animation & Motion

### Framer Motion

Use Framer Motion (via `motion/react`) for all complex animations.

#### Typing Animation

Provides a typewriter effect with customizable cursor:

```tsx
<TypingAnimation
  className="text-primary tracking-tight"
  words={["AI Agents", "ChatGPT", "Claude"]}
/>
```

**Available Props**:
- `words`: Array of strings to cycle through
- `duration`: Speed of typing (default: 100ms)
- `typeSpeed`: Custom typing speed
- `deleteSpeed`: Custom deletion speed
- `delay`: Initial delay before animation starts
- `pauseDelay`: Pause between words (default: 1000ms)
- `loop`: Whether to loop infinitely (default: false)
- `showCursor`: Display cursor (default: true)
- `blinkCursor`: Animate cursor blink (default: true)
- `cursorStyle`: "line" | "block" | "underscore"

**Best Practices**:
- Use for dynamic headlines
- Keep word arrays reasonably short (3-7 words)
- Match text styles with surrounding content
- Use `tracking-tight` to match hero typography

#### Light Rays Effect

Creates animated light ray effects for atmospheric backgrounds:

```tsx
<LightRays color="#321808" speed={7} />
```

**Available Props**:
- `count`: Number of rays (default: 7)
- `color`: Ray color (default: "rgba(160, 210, 255, 0.2)")
- `blur`: Blur amount in pixels (default: 36)
- `speed`: Animation cycle duration in seconds (default: 14)
- `length`: Ray length (default: "70vh")

**Best Practices**:
- Place at bottom of stacking context
- Use dark, subtle colors that match theme (`#321808`)
- Lower speed values = faster animation (inverse relationship)
- Position absolutely within parent container
- Ensure parent has `position: relative`

### Transition Standards

Maintain consistent transition timing across all components:

```tsx
className="transition-colors duration-75 ease-linear"
```

**Standard Values**:
- **Duration**: `duration-75` (75ms) - Quick, responsive feel
- **Easing**: `ease-linear` - Consistent motion
- **Property**: Usually `transition-colors` for subtle interactions

### Animation Guidelines

1. **Performance**: Prefer `transform` and `opacity` for animations
2. **Motion Preference**: Respect `prefers-reduced-motion` (Motion components handle this)
3. **Timing**: Keep animations under 300ms for UI feedback
4. **Purpose**: Only animate when it adds value (state changes, focus, loading)

---

## Patterns & Best Practices

### Class Management

Always use the `cn()` utility for combining conditional classes:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", conditionalClass && "optional-classes", className)}>
```

**Benefits**:
- Merges Tailwind classes intelligently (via `tailwind-merge`)
- Handles conditional classes cleanly (via `clsx`)
- Prevents class conflicts

### Component Structure

Follow these patterns when creating new components:

```tsx
"use client"; // Add if component uses hooks or interactivity

import { cn } from "@/lib/utils";

type ComponentProps = {
  children: React.ReactNode;
  className?: string;
  // other props
};

export default function Component({ className, children, ...props }: ComponentProps) {
  return (
    <div className={cn("default-classes", className)} {...props}>
      {children}
    </div>
  );
}
```

**Guidelines**:
1. Export as default unless it's a utility component
2. Use TypeScript types (not interfaces unless extending)
3. Accept `className` prop for customization
4. Spread remaining props with `{...props}`
5. Use `"use client"` directive only when necessary

### Section Building Pattern

Follow this structure for new landing page sections:

```tsx
<Container className="py-24">
  <div className="flex flex-col gap-8 items-center">
    {/* Section Header */}
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-white text-4xl font-bold tracking-tight text-center">
        Section Title
      </h2>
      <p className="text-zinc-300 text-lg font-normal text-center max-w-2xl">
        Section description
      </p>
    </div>

    {/* Section Content */}
    <div className="grid gap-6 w-full">
      {/* content */}
    </div>
  </div>
</Container>
```

### Responsive Design

Apply mobile-first responsive patterns:

```tsx
className="text-base md:text-lg lg:text-2xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="px-4 md:px-8 lg:px-0"
```

**Breakpoints** (Tailwind defaults):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Code Quality

1. **Never Use Any**: Use `unknown` instead when type can't be inferred
2. **Type Everything**: Explicitly type function parameters and returns
3. **No Barrel Exports**: Export components individually
4. **English Only**: Variables and comments must be in English
5. **Minimal Comments**: Only add comments for complex logic
6. **Use `cn()`**: Always use for className manipulation in component props

### File Organization

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── light-rays.tsx
│   │   └── typing-animation.tsx
│   ├── navbar.tsx       # Layout components
│   └── container.tsx    # Utility components
└── lib/
    └── utils.ts         # Helper functions
```

### Git Workflow

1. Always commit before starting a new batch of changes
2. Use conventional commit messages
3. No "Generated by..." in commit messages
4. No "Co-Authored-By: Claude" lines

### Development Workflow

1. Read existing code before creating new components
2. Reuse existing components and patterns
3. Ask questions when uncertain about implementation
4. Use `nextjs-code-auditor` agent after making changes
5. Run type checking: `bun check-types`
6. Run linting: `bun check`

---

## Component Checklist

When creating a new component or section, ensure:

- [ ] Uses `cn()` utility for class management
- [ ] Accepts `className` prop for customization
- [ ] Uses correct color tokens (white, zinc-*, primary)
- [ ] Follows typography scale and tracking
- [ ] Uses consistent spacing (gap-4, gap-6, gap-8)
- [ ] Implements hover states with `duration-75 ease-linear`
- [ ] Applies responsive classes where needed
- [ ] Uses Container component for page width constraint
- [ ] Adds `"use client"` directive only if necessary
- [ ] Types all props explicitly (no `any`)
- [ ] Exports as default (unless utility component)

---

## Quick Reference

### Common Class Combinations

```tsx
// Hero section
"w-full h-screen flex flex-col gap-6"

// Centered content
"flex flex-col gap-8 items-center"

// Primary CTA button
"uppercase bg-primary text-black font-semibold tracking-tight"

// Secondary button
"text-white hover:border-primary hover:text-primary hover:bg-transparent"

// Section title
"text-white text-4xl font-bold tracking-tight text-center"

// Subheading
"text-zinc-200 text-xl font-semibold leading-relaxed text-center tracking-tight"

// Muted text
"text-zinc-400 text-base font-normal text-center"

// Glassmorphism effect
"backdrop-blur-md bg-transparent border border-primary/40"
```

### Color Quick Access

```tsx
// Text
text-white
text-zinc-200
text-zinc-300
text-zinc-400

// Backgrounds
bg-gray-950
bg-transparent
bg-primary

// Borders
border-[#321808]
border-zinc-800
border-primary/40
```
