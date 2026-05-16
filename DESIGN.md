# Hackatone Design System

This document defines a reusable visual design system for Hackatone. The style is inspired by warm, friendly consumer app interfaces, especially the general visual feeling of Headspace, but it must remain original and adapted to Hackatone's actual product purpose: hackathon creation, registration, check-in, team management, submissions, judging, and event operations.

This design system must not copy Headspace screens, logos, characters, illustrations, copywriting, icons, brand assets, or product concepts.

---

# 1. Design Inspiration Summary

The visual inspiration is limited to the general UI style and emotional tone:

- Warm and friendly interface.
- Rounded UI elements.
- Soft orange and yellow color direction.
- Minimal screens with clear hierarchy.
- Large white and cream spaces.
- Playful but professional feeling.
- Smooth micro-interactions.
- Simple illustrations and icons.
- Mobile-first structure.

The actual app content, features, labels, user flows, and product purpose must remain based on Hackatone. Hackatone is a hackathon management platform, not a wellness, meditation, or mental-health app.

The final experience should feel welcoming and easy to use while still being credible for organizers, participants, judges, and event teams.

---

# 2. Visual Identity

Hackatone should feel:

- Friendly: users should feel guided, not overwhelmed.
- Clean: screens should have clear hierarchy and low visual noise.
- Warm: the palette should use soft cream, orange, yellow, and gentle accent colors.
- Modern: the interface should feel current, responsive, and polished.
- Simple: each screen should have one clear primary task.
- Approachable: participants and organizers should understand the flow quickly.
- Playful but not childish: use soft shapes and friendly illustrations without making the platform feel like a toy.
- Professional enough for a real app: organizer dashboards, judging workflows, and event analytics should remain trustworthy and structured.

Design keywords:

- Warm
- Rounded
- Light
- Clear
- Helpful
- Confident
- Event-focused
- Mobile-first

---

# 3. Color Palette

The color palette uses original warm colors inspired by friendly rounded UI systems. It must not attempt to recreate Headspace colors exactly.

| Color Name | HEX | Usage |
|---|---:|---|
| Primary Orange | `#FF8A3D` | Main CTAs, active states, key highlights, progress accents. |
| Deep Orange | `#E96F26` | Pressed primary buttons, important highlights, active icons. |
| Secondary Yellow | `#FFD166` | Secondary highlights, badges, empty states, illustration accents. |
| Soft Cream Background | `#FFF8EF` | Main app background, onboarding screens, large page backgrounds. |
| Warm Surface | `#FFFFFF` | Cards, sheets, modals, forms, list items. |
| Soft Peach Surface | `#FFE8D6` | Highlight cards, announcement cards, event status surfaces. |
| Dark Charcoal Text | `#2B2B2B` | Primary text, page titles, important labels. |
| Muted Gray Text | `#77716A` | Supporting text, captions, metadata, helper text. |
| Soft Green Success | `#7BCFA6` | Completed status, checked-in state, successful submission. |
| Deep Success Text | `#226B49` | Text on success badges or success messages. |
| Soft Red Orange Warning | `#FFB199` | Warning states, deadline alerts, missing information. |
| Deep Warning Text | `#9B3D20` | Text on warning badges or warning messages. |
| Soft Blue Info | `#CFE8FF` | Informational cards, organizer notes, neutral system messages. |
| Border Color | `#E8DED4` | Card borders, input borders, dividers. |
| Disabled Background | `#EDE7DF` | Disabled buttons, inactive controls, unavailable actions. |
| Disabled Text | `#AAA199` | Disabled labels and icons. |

Color usage rules:

- Use Primary Orange only for the most important action on a screen.
- Use Secondary Yellow sparingly for warmth and friendly highlights.
- Keep backgrounds mostly Soft Cream Background or Warm Surface.
- Use Dark Charcoal Text for readability.
- Do not place low-contrast gray text on orange or yellow backgrounds.
- Status colors must include text labels or icons so the interface does not rely only on color.

---

# 4. Typography

Hackatone should use a clean rounded sans-serif font. Typography should feel friendly but not childish. Headings can be bold and warm, while body text should remain practical and readable.

## Font Family Suggestions

Preferred:

- `Nunito Sans`
- `Aptos`
- `Manrope`
- `Plus Jakarta Sans`
- `Inter` only if the team already uses it

Recommended CSS stack:

```css
font-family: "Nunito Sans", "Manrope", "Plus Jakarta Sans", system-ui, sans-serif;
```

## Type Scale

| Token | Mobile Size | Desktop Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---:|---|
| Display | `32px` | `44px` | `800` | `1.08` | Onboarding headline, major landing title. |
| H1 | `28px` | `36px` | `800` | `1.12` | Main screen title. |
| H2 | `22px` | `28px` | `700` | `1.2` | Section title, dashboard group title. |
| H3 | `18px` | `22px` | `700` | `1.25` | Card title, modal title. |
| Body Large | `17px` | `18px` | `500` | `1.55` | Main explanatory copy. |
| Body | `15px` | `16px` | `400` | `1.55` | Normal UI text. |
| Body Strong | `15px` | `16px` | `700` | `1.45` | Important list text, row titles. |
| Label | `13px` | `14px` | `700` | `1.3` | Form labels, small headers. |
| Caption | `12px` | `13px` | `500` | `1.35` | Metadata, helper text, timestamps. |
| Tiny | `11px` | `12px` | `700` | `1.25` | Badges, small status labels. |

## Typography Rules

- Use large bold headings for top-level screens.
- Keep section titles short and clear.
- Body text should be comfortable and readable.
- Avoid long paragraphs inside cards.
- Labels should be concise and consistent.
- Do not use overly decorative fonts.
- Avoid negative letter spacing.
- Use sentence case for most UI labels.
- Use title case only for page titles, section titles, and navigation labels.

---

# 5. Layout System

Hackatone should be mobile-first. The mobile app must feel natural on phones, and the dashboard should scale cleanly to tablet and desktop.

## Layout Principles

- Mobile-first design.
- Clean page structure.
- Large padding around important content.
- Rounded cards.
- Bottom navigation when needed.
- Simple top headers.
- Spacious sections.
- Card-based content.
- Avoid clutter.
- Prefer one primary action per screen.
- Use sticky actions for important form completion steps.

## Spacing Tokens

| Token | Value | Usage |
|---|---:|---|
| `space-1` | `4px` | Fine spacing, icon gaps, compact adjustments. |
| `space-2` | `8px` | Small gaps, badge padding, tight stacks. |
| `space-3` | `12px` | Input internal spacing, compact card spacing. |
| `space-4` | `16px` | Standard screen padding, card padding on mobile. |
| `space-6` | `24px` | Section spacing, large card padding. |
| `space-8` | `32px` | Major screen separation, dashboard sections. |
| `space-12` | `48px` | Large empty-state spacing, onboarding sections. |

## Page Structure

Mobile page:

- Top safe area.
- Header with title and optional icon action.
- Main content area with cards and sections.
- Sticky primary action when the user must complete a task.
- Bottom navigation for core participant app areas.

Desktop dashboard:

- Sidebar or top navigation depending on app complexity.
- Main page title area.
- KPI or summary cards.
- Main table or workflow area.
- Secondary side panel only when useful.

## Container Sizes

- Mobile content padding: `16px`.
- Tablet content padding: `24px`.
- Desktop content padding: `32px`.
- Max readable content width: `1120px`.
- Form max width: `720px`.
- Detail page max width: `920px`.

---

# 6. Components

All components should use consistent radius, spacing, and interaction behavior. Components should be reusable across the participant app, organizer dashboard, judging view, and public event pages.

## Buttons

### Primary Button

- Shape: pill or rounded rectangle.
- Border radius: `999px` for mobile CTAs, `16px` for dashboard CTAs.
- Padding: `14px 20px` mobile, `12px 18px` desktop.
- Colors: Primary Orange background, white text.
- Typography: `15px`, weight `800`.
- Hover state: slightly darker orange.
- Active state: scale to `0.97`, Deep Orange background.
- Mobile behavior: full width for main screen action; inline only for secondary actions.
- Use for: register, create hackathon, submit project, publish results.

### Secondary Button

- Shape: rounded rectangle or pill.
- Border radius: `999px` mobile, `16px` desktop.
- Padding: `12px 18px`.
- Colors: Soft Peach Surface or Warm Surface background with Primary Orange text.
- Border: `1px solid #FFD6B8` when on cream background.
- Hover state: background becomes slightly warmer.
- Active state: scale to `0.98`.
- Use for: preview, save draft, copy link, view details.

### Text Button

- Shape: no container by default.
- Padding: `8px 4px`.
- Colors: Primary Orange text.
- Typography: `14px`, weight `800`.
- Hover state: underline or soft orange background.
- Active state: Deep Orange text.
- Use for: resend invite, edit details, change team, view all.

### Icon Button

- Shape: circle or rounded square.
- Size: `40px` mobile, `36px` desktop.
- Border radius: `999px` for circle, `12px` for square.
- Colors: Warm Surface background, Dark Charcoal icon.
- Border: optional `1px solid Border Color`.
- Hover state: Soft Peach Surface.
- Active state: scale to `0.95`.
- Mobile behavior: must remain at least `44px` tap target when used in dense UI.
- Use for: back, scan QR, copy, share, filter, settings.

### Disabled Button

- Shape: same as enabled button.
- Colors: Disabled Background with Disabled Text.
- Cursor: default or not-allowed depending on platform.
- Typography: same as enabled button.
- Behavior: no hover animation and no press effect.
- Must include reason through helper text when action is blocked.

### Loading Button

- Shape: same as primary or secondary.
- Colors: same base color with slightly reduced contrast.
- Content: loading spinner plus short label, for example `Submitting`.
- Interaction: disabled while loading.
- Motion: spinner duration `800ms` to `1200ms`.
- Use for: registration submit, project submission, QR verification, score saving.

## Cards

### Feature Card

- Shape: rounded rectangle.
- Border radius: `24px`.
- Padding: `20px`.
- Colors: Warm Surface or Soft Peach Surface.
- Border: optional `1px solid Border Color`.
- Typography: bold title, short supporting text.
- Hover state: desktop only, slight lift and soft shadow.
- Active state: scale to `0.99`.
- Mobile behavior: full width, stacked vertically.
- Use for: event features, dashboard modules, onboarding choices.

### Info Card

- Shape: rounded rectangle.
- Border radius: `20px`.
- Padding: `16px`.
- Colors: Soft Blue Info, Soft Peach Surface, or Soft Cream Background.
- Typography: small label, clear value.
- Hover state: none unless clickable.
- Active state: none unless clickable.
- Mobile behavior: full width.
- Use for: event rules, deadlines, organizer notes, judging instructions.

### Action Card

- Shape: rounded rectangle.
- Border radius: `24px`.
- Padding: `20px`.
- Colors: Primary Orange, Secondary Yellow, or Warm Surface.
- Typography: bold title and clear CTA.
- Hover state: lift by `2px`, shadow increases.
- Active state: scale to `0.98`.
- Mobile behavior: full-width tappable card.
- Use for: create event, register, check in, submit project.

### Progress / Stat Card

- Shape: rounded rectangle.
- Border radius: `20px`.
- Padding: `16px`.
- Colors: Warm Surface.
- Typography: small label, large number, muted context.
- Hover state: subtle lift on desktop.
- Active state: none unless clickable.
- Mobile behavior: two-column grid when space allows, one column on small screens.
- Use for: registrations, checked-in count, submitted projects, judging progress.

### List Item Card

- Shape: rounded rectangle.
- Border radius: `18px`.
- Padding: `14px 16px`.
- Colors: Warm Surface.
- Border: `1px solid Border Color`.
- Typography: title, metadata, optional badge.
- Hover state: Soft Cream Background.
- Active state: border uses Primary Orange.
- Mobile behavior: stacked metadata, clear tap target.
- Use for: events, teams, submissions, participants, judging assignments.

## Navigation

### Bottom Navigation

- Shape: fixed bottom bar with rounded top corners or floating pill bar.
- Border radius: `24px 24px 0 0` or `999px` for floating style.
- Padding: `8px 12px`.
- Colors: Warm Surface background.
- Icons: rounded line icons, filled active state.
- Typography: `11px` or `12px`, weight `700`.
- Active state: Primary Orange icon/text with Soft Peach Surface background.
- Mobile behavior: 3 to 5 items maximum.
- Use for: Home, Events, Scan, Teams, Profile.

### Top Header

- Shape: flat or softly curved section.
- Padding: `16px`.
- Colors: Soft Cream Background or Warm Surface.
- Typography: large bold title, optional subtitle.
- Hover state: none.
- Mobile behavior: title wraps cleanly, actions remain right-aligned.
- Use for: screen title, event title, dashboard page title.

### Back Button

- Shape: circular icon button.
- Size: `40px` to `44px`.
- Colors: Warm Surface or transparent.
- Icon: simple left arrow.
- Hover state: Soft Peach Surface.
- Active state: scale to `0.95`.
- Mobile behavior: always easy to reach at top left.

### Search Bar

- Shape: rounded pill.
- Border radius: `999px`.
- Padding: `12px 16px`.
- Colors: Warm Surface background.
- Border: `1px solid Border Color`.
- Typography: `15px`.
- Hover state: border slightly darker.
- Active/focus state: Primary Orange border and soft focus shadow.
- Mobile behavior: full width.
- Use for: event search, participant search, project search.

### Tabs / Category Filters

- Shape: segmented rounded pills.
- Border radius: `999px`.
- Padding: `8px 12px`.
- Colors: inactive Warm Surface, active Primary Orange or Soft Peach Surface.
- Typography: `13px`, weight `800`.
- Hover state: Soft Peach Surface.
- Active state: strong contrast and optional icon.
- Mobile behavior: horizontally scrollable if many filters.
- Use for: tracks, event statuses, submission statuses, judging stages.

## Forms

### Text Input

- Shape: rounded rectangle.
- Border radius: `16px`.
- Padding: `14px 16px`.
- Colors: Warm Surface background.
- Border: `1px solid Border Color`.
- Typography: `15px`.
- Hover state: border slightly darker.
- Focus state: Primary Orange border, subtle focus ring.
- Mobile behavior: full width and at least `44px` height.

### Search Input

- Shape: pill.
- Border radius: `999px`.
- Padding: `12px 16px`.
- Left icon: search icon with muted color.
- Focus state: Primary Orange border.
- Mobile behavior: full width, clears with icon button.

### Select / Dropdown

- Shape: rounded rectangle.
- Border radius: `16px`.
- Padding: `14px 16px`.
- Colors: Warm Surface.
- Border: `1px solid Border Color`.
- Typography: `15px`.
- Hover state: border slightly darker.
- Active state: Primary Orange border.
- Mobile behavior: native select or accessible custom sheet.

### Textarea

- Shape: rounded rectangle.
- Border radius: `18px`.
- Padding: `14px 16px`.
- Min height: `120px`.
- Colors: Warm Surface.
- Typography: `15px`, comfortable line height.
- Focus state: Primary Orange border.
- Mobile behavior: full width, clear character count when needed.

### Error Message

- Shape: small rounded message or inline text.
- Colors: Soft Red Orange Warning background with Deep Warning Text.
- Border radius: `12px`.
- Padding: `8px 12px`.
- Typography: `13px`, weight `700`.
- Mobile behavior: placed directly below the related field.
- Must include text and not rely only on red/orange color.

### Success Message

- Shape: small rounded message or toast.
- Colors: Soft Green Success background with Deep Success Text.
- Border radius: `12px`.
- Padding: `8px 12px`.
- Typography: `13px`, weight `700`.
- Mobile behavior: toast should not block the primary action.

## Badges

### Category Badge

- Shape: pill.
- Border radius: `999px`.
- Padding: `5px 10px`.
- Colors: Soft Peach Surface, Soft Blue Info, or Secondary Yellow.
- Typography: `12px`, weight `800`.
- Hover state: none unless clickable.
- Active state: stronger fill and border.
- Use for: tracks, event categories, project themes.

### Status Badge

- Shape: pill.
- Border radius: `999px`.
- Padding: `5px 10px`.
- Colors: status-based with readable text.
- Typography: `12px`, weight `800`.
- Hover state: none.
- Active state: none unless status is clickable.
- Use for: registered, checked in, submitted, judged, published.

### Highlight Badge

- Shape: pill or rounded label.
- Border radius: `999px`.
- Padding: `6px 12px`.
- Colors: Primary Orange with white text or Secondary Yellow with Dark Charcoal Text.
- Typography: `12px`, weight `900`.
- Use for: winner, finalist, featured project, live event.

---

# 7. Illustration and Icon Style

## Illustration Guidelines

Illustrations should be original and simple. They should support the app's hackathon/event purpose without copying any existing brand style or characters.

Use:

- Simple geometric illustrations.
- Rounded shapes.
- Abstract objects.
- Soft waves.
- Circles.
- Friendly event-related objects such as tickets, badges, laptops, trophy shapes, QR cards, team bubbles, and submission cards.
- Minimal characters only if needed.
- Warm colors from the design palette.
- Low-detail scenes that load quickly and scale well.

Avoid:

- Detailed realistic graphics.
- Copied Headspace characters.
- Any Headspace logo, brand assets, icons, text, illustrations, or mascot-like references.
- Wellness, meditation, or mental-health imagery unless the product itself requires it.
- Heavy gradients or overly complex decorative art.

## Icon Guidelines

Icons should be:

- Rounded line icons.
- Simple filled icons for active navigation states.
- Consistent stroke width, ideally `2px`.
- Minimal in detail.
- Easy to understand at small sizes.
- Paired with text labels when meaning may be unclear.

Recommended icon categories:

- Event calendar.
- QR scan.
- Team.
- Submission.
- Trophy.
- Judge score.
- Notification.
- Settings.
- Search.
- Copy link.
- Check-in.

---

# 8. Animation and Motion Guidelines

Motion should feel calm, friendly, and smooth. It should make Hackatone feel polished without distracting organizers or participants.

## Animation Types

### Gentle Fade In

- Use for screen content and empty states.
- Duration: `250ms` to `400ms`.
- Easing: soft ease-out.
- Example: page sections fade in after loading.

### Smooth Card Entrance

- Use for dashboards, event cards, team cards, and project cards.
- Duration: `300ms` to `500ms`.
- Movement: translate up from `8px` to `16px`.
- Example: cards fade in and move up slightly.

### Button Press Scale

- Use for all tappable buttons.
- Duration: `150ms`.
- Transform: scale to `0.97`.
- Example: primary button compresses slightly when pressed.

### Floating Decorative Shapes

- Use sparingly in onboarding, empty states, and celebratory screens.
- Duration: `800ms` to `1200ms` or slow looping `6s` to `10s`.
- Movement: subtle vertical movement only.
- Example: background shape slowly moves up and down.

### Soft Background Wave Movement

- Use only in non-dense screens like onboarding or success pages.
- Duration: `800ms` to `1200ms` for entrance, or slow looping.
- Movement: very subtle.
- Avoid if it distracts from forms or dashboards.

### Progress Bar Animation

- Use for registration completion, judging completion, check-in counts, or build progress.
- Duration: `500ms` to `800ms`.
- Example: progress bar fills smoothly when data loads.

### Loading Animation

- Use simple spinner, pulsing dots, or skeleton loading.
- Duration: `800ms` to `1200ms`.
- Avoid complex animated illustrations during important workflows.

### Page Transition

- Use for mobile navigation and modal-like screens.
- Duration: `250ms` to `350ms`.
- Motion: fade plus slight horizontal or upward movement.

### Modal Open / Close

- Duration: `200ms` to `300ms`.
- Open: fade in with slight upward motion.
- Close: fade out and slight downward motion.
- Backdrop: soft fade.

## Motion Rules

- Keep motion soft and simple.
- Avoid fast aggressive animation.
- Use calm easing curves.
- Use durations from `150ms` to `1200ms` depending on animation type.
- Support reduced-motion accessibility settings.
- Do not animate large dashboard tables unnecessarily.
- Do not block user actions with decorative motion.

Reduced motion behavior:

- Disable floating loops.
- Replace movement with simple fades.
- Keep essential feedback, such as button pressed states, but reduce scale/motion.

---

# 9. Screen Design Patterns

These patterns are general and can fit any Hackatone screen type.

## Home / Dashboard Screen

Use for participant app home and organizer dashboard.

Structure:

- Friendly header.
- Main highlighted card.
- Quick action buttons.
- Recent activity or recommended section.
- Clear status indicators.

Hackatone examples:

- Participant sees current hackathon, check-in status, team, and next deadline.
- Organizer sees active hackathons, registration count, check-ins, and submissions.

## Details Screen

Use for events, teams, projects, submissions, and judging details.

Structure:

- Large title.
- Main content card.
- Clear action button.
- Related information section.
- Timeline or status area when useful.

Hackatone examples:

- Event detail screen with schedule, rules, location, and registration button.
- Submission detail screen with project links and judge scores.

## List / Browse Screen

Use for events, participants, teams, submissions, judges, and project galleries.

Structure:

- Search bar.
- Category filters.
- Rounded list cards.
- Empty state illustration.
- Clear sort/filter controls.

Hackatone examples:

- Browse hackathons.
- Organizer views all participants.
- Judge views assigned projects.

## Creation / Form Screen

Use for event creation, registration, team creation, and project submission.

Structure:

- Simple step-by-step layout.
- Clear input fields.
- Sticky primary action button.
- Helpful validation messages.
- Optional save draft action.

Hackatone examples:

- Create hackathon form.
- Register participant form.
- Submit project form.

## Profile / Settings Screen

Use for participant profile, organizer account, and app settings.

Structure:

- User or organization summary card.
- Stats or preferences.
- Settings list.
- Logout/account actions.
- Clear account role display.

Hackatone examples:

- Participant profile with skills and team status.
- Organizer settings with organization name and team members.

## Onboarding Screen

Use for first-time users.

Structure:

- Large friendly illustration.
- Short headline.
- Simple supporting text.
- Clear CTA button.
- Optional role selection.

Hackatone examples:

- Choose role: organizer, participant, judge.
- Explain registration, QR check-in, and submissions in 2 to 3 screens.

---

# 10. Accessibility Rules

Hackatone must be usable and readable for all users.

Requirements:

- Use high contrast text.
- Keep primary text Dark Charcoal on light backgrounds.
- Use large tap targets, minimum `44px` by `44px`.
- Provide clear focus states for keyboard navigation.
- Support keyboard navigation in the web dashboard.
- Add screen reader labels for icon-only buttons.
- Use semantic headings and landmarks in web views.
- Support reduced motion settings.
- Do not rely only on color to communicate status.
- Use text labels for all important badges and states.
- Keep text readable on orange/yellow backgrounds.
- Avoid placing muted gray text on colored backgrounds.
- Form errors must identify the field and explain the fix.
- QR scan/check-in flows must include manual fallback input.
- Charts must include labels, summaries, or accessible table equivalents.

Focus state recommendation:

- Use a `2px` Primary Orange outline.
- Add `2px` offset.
- Do not remove browser focus styles unless replacing with an accessible equivalent.

---

# 11. CSS Design Tokens

Use these CSS variables as the baseline design tokens. Adjust only when there is a strong product reason.

```css
:root {
  /* Colors */
  --color-primary: #FF8A3D;
  --color-primary-pressed: #E96F26;
  --color-secondary: #FFD166;
  --color-background: #FFF8EF;
  --color-surface: #FFFFFF;
  --color-surface-soft: #FFE8D6;
  --color-text: #2B2B2B;
  --color-text-muted: #77716A;
  --color-success: #7BCFA6;
  --color-success-text: #226B49;
  --color-warning: #FFB199;
  --color-warning-text: #9B3D20;
  --color-info: #CFE8FF;
  --color-border: #E8DED4;
  --color-disabled: #EDE7DF;
  --color-disabled-text: #AAA199;
  --color-focus: #FF8A3D;

  /* Typography */
  --font-family-base: "Nunito Sans", "Manrope", "Plus Jakarta Sans", system-ui, sans-serif;
  --font-size-display: 32px;
  --font-size-h1: 28px;
  --font-size-h2: 22px;
  --font-size-h3: 18px;
  --font-size-body-lg: 17px;
  --font-size-body: 15px;
  --font-size-label: 13px;
  --font-size-caption: 12px;
  --font-size-tiny: 11px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-extra-bold: 800;
  --font-weight-black: 900;

  --line-height-tight: 1.12;
  --line-height-title: 1.2;
  --line-height-body: 1.55;
  --line-height-caption: 1.35;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Border Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(43, 43, 43, 0.06);
  --shadow-sm: 0 4px 12px rgba(43, 43, 43, 0.08);
  --shadow-md: 0 10px 28px rgba(43, 43, 43, 0.1);
  --shadow-lg: 0 18px 48px rgba(43, 43, 43, 0.12);

  /* Animation Durations */
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-medium: 500ms;
  --duration-slow: 800ms;
  --duration-extra-slow: 1200ms;

  /* Easing */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-press: cubic-bezier(0.3, 0, 0.2, 1);

  /* Layout */
  --container-max: 1120px;
  --form-max: 720px;
  --detail-max: 920px;
  --tap-target-min: 44px;
  --bottom-nav-height: 72px;
}

@media (min-width: 768px) {
  :root {
    --font-size-display: 44px;
    --font-size-h1: 36px;
    --font-size-h2: 28px;
    --font-size-h3: 22px;
    --font-size-body-lg: 18px;
    --font-size-body: 16px;
    --font-size-label: 14px;
    --font-size-caption: 13px;
    --font-size-tiny: 12px;
  }
}
```

---

# 12. Implementation Notes

- This design system is only visual inspiration.
- Hackatone's actual content and features should follow the hackathon platform idea.
- Do not force wellness, meditation, or mental-health wording into Hackatone.
- Use reusable components.
- Use consistent spacing and border radius.
- Keep the interface clean and warm.
- Keep animations subtle.
- Do not copy Headspace screens exactly.
- Do not use Headspace assets or brand elements.
- Do not use Headspace characters, logo, icons, images, copywriting, or illustration style directly.
- Keep mobile screens focused on one main task at a time.
- Keep organizer dashboards more structured and information-dense than participant screens.
- Use sample data during development so dashboards and lists look realistic.
- Design QR check-in as a central demo moment.
- Make empty states friendly but still related to hackathons, events, teams, and submissions.
- Avoid decorative elements that slow down the app or distract from the event workflow.
- Keep status states clear: registered, checked in, team created, submitted, judging, published.
- Build the design system as tokens plus components before creating many custom screens.
