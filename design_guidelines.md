# SHISYA Student Portal - Design Guidelines

## Design Approach
**Hybrid Approach**: Material Design System foundations + inspiration from modern learning platforms (Notion's clarity, Linear's typography, Coursera's learning UX)

**Core Principles**:
- Learning-first: Content takes center stage, UI recedes
- Calm progression: Visual hierarchy guides the learning journey
- Trust through clarity: No distractions, clear progress indicators
- Accessible knowledge: High contrast, readable typography, intuitive navigation

---

## Typography System

**Font Stack**:
- Primary: Inter (Google Fonts) - body text, UI elements
- Secondary: Space Grotesk (Google Fonts) - headings, course titles

**Type Scale**:
- Hero/Course Titles: text-4xl md:text-5xl font-bold
- Page Headings: text-2xl md:text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Module/Lesson Titles: text-lg font-medium
- Body Text: text-base leading-relaxed
- Metadata (duration, level): text-sm text-muted-foreground
- Captions: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-8, space-y-12
- Container gaps: gap-6, gap-8

**Container Strategy**:
- Page containers: max-w-7xl mx-auto px-4 md:px-8
- Content reading width: max-w-4xl (lesson viewer)
- Card grids: max-w-6xl

**Grid Patterns**:
- Course catalog: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Learn view: Two-column split (sidebar + content) on desktop, stacked on mobile

---

## Component Library

### Course Catalog Page
**Layout**: Clean grid with generous breathing room
- Course cards: Elevated cards (shadow-md) with hover:shadow-lg transition
- Card structure: Image placeholder area (aspect-video), title, metadata row (level + duration badges), short description, skills tags, CTA button
- Empty state: Centered with illustration placeholder and friendly message

### Course Overview Page
**Layout**: Single-column content flow, max-w-4xl
- Hero section: Course title (large), metadata badges in a row
- Content sections: Description, Skills grid (2-3 columns), Certificate requirements (info cards)
- Fixed CTA: Sticky bottom bar on mobile with "Go to Course" button

### Learn View (Modules & Lessons)
**Layout**: Sidebar navigation pattern
- Left sidebar (w-80 on desktop): Scrollable modules accordion, progress indicator at top
- Main content area: Lesson list or active lesson content
- Mobile: Collapsible drawer for module navigation
- Module accordion: Border-left accent on active module, chevron indicators
- Lesson items: Checkbox icon, title, time estimate, completion checkmark

### Lesson Viewer
**Layout**: Focused reading experience
- Breadcrumb navigation at top
- Content width: max-w-3xl for optimal readability
- Content blocks: Objectives (bulleted list in subtle card), Key concepts (numbered or icon-based), AI notes (rich text), video embed (16:9 ratio), resources (link list)
- Bottom actions bar: "Mark Complete" primary button, "Back to Course" secondary

---

## Navigation

**Top Navigation**:
- Logo/brand: "SHISYA" (text-xl font-bold)
- Minimal nav: "Courses" link returns to catalog
- Future-ready: Space for user avatar (right-aligned)
- Mobile: Hamburger menu if needed

**Progress Indicators**:
- Module level: Fraction "X/Y lessons" with subtle progress bar
- Course level: Percentage or visual ring indicator
- Completed items: Green checkmark icon

---

## UI Patterns

**Badges**:
- Level badges: Small pill (px-3 py-1 rounded-full text-xs), outline style
- Duration: Clock icon + text
- Skills: Rounded tags (bg-secondary text-secondary-foreground)

**Buttons**:
- Primary CTA: Full-width on mobile, max-w-xs on desktop, rounded-lg, font-medium
- Secondary: Outline variant
- Icon buttons: Shadcn icon size conventions

**Cards**:
- Course cards: rounded-xl border shadow-sm hover:shadow-md transition-shadow
- Info cards: rounded-lg bg-muted/50 p-6

**Loading States**:
- Skeleton screens matching content structure
- Shimmer animation for cards

---

## Images

**Hero/Featured Images**:
- Course catalog cards: Placeholder areas for course thumbnails (aspect-video, rounded-t-xl)
- Course overview: Optional large hero image (aspect-[21/9]) with course title overlaid
- Lesson viewer: Video embeds take full content width
- No large hero on homepage - lead directly with course grid

**Image Treatment**:
- Subtle rounded corners (rounded-lg to rounded-xl)
- Lazy loading for performance
- Placeholder: Gradient backgrounds with course initial or icon

---

## Micro-interactions

**Minimal Animation**:
- Card hover: Subtle shadow and translate-y lift
- Accordion expand: Smooth height transition
- Checkbox complete: Scale and checkmark animation
- Page transitions: Fade-in for content

---

## Accessibility

- Focus states: Clear ring-2 ring-primary
- Color contrast: WCAG AA minimum
- Keyboard navigation: Full support for all interactive elements
- Screen reader: Proper ARIA labels for progress indicators, completion states