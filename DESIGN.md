---
name: Run Event — Start Line
description: Thai-first running discovery with athletic photography, ink navigation, and lime actions.
colors:
  accent: "#d8ed83"
  accent-hover: "#c5de66"
  night: "#131c1a"
  ink: "#17231e"
  muted: "#53635b"
  blue: "#355d23"
  blue-dark: "#233f17"
  blue-soft: "#eef4df"
  focus: "#577d2c"
  surface: "#ffffff"
  background: "#f8f9f5"
  surface-subtle: "#f0f3ed"
  surface-info: "#eff4e7"
  line: "#dce2da"
  line-strong: "#b4c0b1"
  field-border: "#7d8f7e"
  green: "#246344"
  surface-success: "#eaf4eb"
  warning: "#805014"
  danger: "#a52e36"
  surface-danger: "#fff5f4"
  line-danger: "#ce8b90"
typography:
  display:
    fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif'
    fontSize: "clamp(44px, 4.7vw, 72px)"
    fontWeight: 700
    lineHeight: 1.27
    letterSpacing: "-.025em"
  headline:
    fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif'
    fontSize: "clamp(27px, 3vw, 38px)"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif'
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  tag: "4px"
  status: "5px"
  control: "8px"
  search: "10px"
  panel: "12px"
  card: "14px"
  registration: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.night}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-white:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  event-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  registration-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
  category-selected:
    backgroundColor: "{colors.night}"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "10px 19px"
---

# Design System: Run Event — Start Line

## Overview

**Creative North Star: "Start Line"**

Start Line pairs the energy of running photography with clear Thai typography and direct actions. Ink navigation frames the photographic home entrance; lime marks the next useful action. Registration, lookup, and reading surfaces use white and pale green materials so task content remains clear on a phone.

This is the implemented replacement world approved for Run Event. Its visual language is modern sports, mobile-first, with prominent event imagery and controlled bright color. The generic runner photograph is explicitly illustrative; event images and factual content come from the API.

**Key Characteristics:**

- Athletic photography and ink framing.
- Thai-first typography and generous touch targets.
- Lime actions, quiet light task surfaces.
- Border-led cards and explicit semantic states.

Source authority: `layout.tsx` loads tokens, globals, header, motion, then `start-line.css`. The final stylesheet overrides the former blue identity; the legacy `blue` variable names now resolve to green. Route registration styles also apply; the more specific `body .reg-*` rules retain the replacement treatments. This document records source cascade outcomes, not a browser-computed audit. Refresh it after stylesheet changes.

## Colors

The palette places fresh lime against deep green ink, with warm near-white task surfaces.

### Primary

- **Start Lime** (`accent`): main actions, the second hero heading line, active navigation accents, and current registration steps. `accent-hover` darkens the action on hover.
- **Track Ink** (`night`): navigation, footer, hero foundation, selected category, and the registration progress band.

### Secondary

- **Field Green** (`blue`, `blue-dark`, `blue-soft`): links, icons, secondary interactions, and pale selected surfaces. These source names are retained for compatibility.
- **Focus Green** (`focus`): keyboard focus on light surfaces. Header focus uses lime; hero copy/caption focus remains white.

### Neutral

- **Reading Ink** (`ink`) and **Quiet Green Gray** (`muted`): headings/body and supporting text.
- **White Surface**, **Offwhite Background**, and **Subtle Surface**: content, canvas, and low emphasis groups.
- **Information Surface**, **Line**, **Strong Line**, and **Field Border**: notes, dividers, stronger outlines, and form boundaries.

Semantic success retains green, warning retains amber, and errors retain red with pale error fill and a distinct border. Open event badges use a separate pale green fill and dark green text; closed and upcoming statuses remain distinct. Do not reinterpret submission success as payment approval.

**The Action Rule.** Use lime for the main next action and the established active-step treatment; preserve semantic error and warning colors.

## Typography

**Display Font / Body Font:** Noto Sans Thai, followed by the Thai-capable fallback stack in the tokens. Bundled weights are 400, 500, 600, and 700. Numerals use the same leading family with Arial only late in the numeric fallback stack.

The hierarchy is role-based rather than a strict modular scale. Bold, upright Thai headings carry the sports character; long-form content keeps relaxed line spacing. Do not force uppercase styling onto Thai text.

- **Display:** hero role in the frontmatter; at 1020px and below it is 54px, then at 600px and below `clamp(32px, 9.3vw, 40px)` with line-height 1.35.
- **Headline:** section/page role; 27px on phones. Detail headings use `clamp(28px, 3vw, 42px)`, 29px on phones. Guide introductory headings use `clamp(30px, 3.5vw, 44px)`.
- **Title:** event card heading role, including on phones; list cards retain their own smaller heading rules.
- **Body:** 15px base; supporting UI copy is generally 14px, interactive fields 16px. Hero copy is 16px/1.85, then 14px/1.75 on phones. Guide prose is constrained to 70ch.
- **Label:** 14px UI labels. Some nonessential hero captions/search labels and mobile progress labels are 11–12px exceptions; do not use these exceptions for body copy.

**The Thai Reading Rule.** Preserve Thai-capable fonts, readable body text, and the established relaxed line heights.

## Layout

The centered container is `min(1240px, calc(100% - 80px))`; at 1020px and below it uses 48px total gutters, and at 600px and below 40px total gutters. Header height is 80px, then 72px, then 68px. Navigation becomes a disclosure menu at 1020px and below, retaining 44px controls and 48px menu rows.

The hero is at least 610px tall, 660px from 1600px up, 590px at tablet width, and 568px on phones. Its search is positioned at the bottom of the hero; on phones it becomes a single column of white fields and a full-width lime action. Labels remain accessible while visually hidden. The mobile quick-guide row is hidden.

Event grids are three columns, two at 800px and below, and one at 600px and below. Mobile cards use 20px body padding; desktop uses 22px. Catalogue spacing becomes 32px on phones. Filters wrap and mobile selects form two columns. Registration fields use three columns, two at 1000px and below, and one at 600px and below; review content becomes one column at 1000px. Keep four progress steps visible and wrap supporting labels.

Use the observed 8/12/16/20/24/32px rhythm; specific controls and typography also use optical intermediate values. Do not replace real empty, loading, error, or disabled states with invented event data.

## Elevation & Depth

Most replacement surfaces are flat. Borders, white/pale surfaces, and dark bands create hierarchy; event cards, the search panel, header, and event summary explicitly have no shadow. Retained exceptions are the mobile navigation (`0 12px 35px rgb(24 43 64 / 12%)`), selected view toggle (`0 1px 4px #25486812`), selected delivery choice (`0 0 0 1px var(--blue)`), and leave dialog (`0 20px 60px rgb(24 43 64 / .22)`) with its translucent backdrop.

**The Flat Surface Rule.** Keep ordinary content cards flat; reserve retained elevation for overlays and selected controls.

Motion supports entry and state changes. The home image/copy/search enter through GSAP; secondary page headings and the runner guide also have restrained entry motion. Common buttons use 180ms state transitions when motion is allowed. Reduced-motion styles disable CSS transitions/animations and the GSAP preference gate avoids entrance motion.

## Shapes

Use upright rounded rectangles: controls 8px, search/notes 10px, panels 12px, event cards 14px, registration card and leave dialog 16px. Small distance tags use 4px and status labels 5px. Save controls and progress numbers remain circular. The replacement logo mark is upright, with lime fill and dark ink; it does not retain the old skewed silhouette.

## Components

### Buttons

Confident, legible actions: the base button has 48px minimum height, 12px 22px padding, weight 600, and 1.5 line-height. Primary uses lime/dark ink and darker lime hover. Outline uses transparent fill and strong neutral border, then pale green/green border on hover. White buttons use white/muted and pale green hover. Base focus is a 3px green outline, offset 4px. Disabled buttons retain 0.6 opacity and use the replacement not-allowed cursor. Route-specific footer/dialog button sizing may remain 44px.

### Chips

Category controls are bordered rounded rectangles; selected is dark with lime text. Unselected hover is pale green with a stronger border. Distance tags are compact, pale neutral, and numeric-font capable. Event status badges include text and a dot, with distinct open/closed/upcoming treatments.

### Cards / Containers

Event cards have white fill, a subtle 1px border, 14px rounding, clipped artwork, and no shadow. Hover strengthens the border. Event artwork comes from the API; generic fallback artwork must remain identifiable as such. Empty states use a bordered white container, icon, concise heading, and meaningful action when available.

### Inputs / Fields

Registration fields have 48px minimum height, 16px text, 11px 13px padding, white fill, field-border outline, and 8px rounding. Focus uses a 3px ring offset 2px and green border. **Cascade detail:** `body .reg-field input/select` has greater specificity than registration hover, invalid, and disabled selectors for border/background; those overrides currently keep field border and white fill in those states. Error text and summaries remain red; disabled input text/cursor still change. Do not document the overridden pale-red field fill as effective behavior. The lookup direct input is 48px high and at most 240px wide.

### Navigation

Sticky ink header with pale text and icons; selected links use a darker green panel and lime text, hover uses the panel and white text. Saved-event control is an outlined 44px control, icon-only on phones. Mobile menu opens below the header; preserve disclosure state, keyboard behavior, and focus treatment.

### Registration Progress and Leave Dialog

Dark progress band uses muted pending steps, lime current/completed labels, a lime current circle with dark text, and green completed circles with lime text. Numbers are 46px circles, 38px on phones. The light registration body remains separate. The leave guard uses a bounded native dialog, a scrollable content area, and actions on a subtle surface; preserve the existing unsaved-entry protection.

## Do's and Don'ts

### Do:

- **Do** keep lime actions readable with dark ink text.
- **Do** use Thai-capable fonts and retain generous mobile touch targets.
- **Do** preserve real loading, empty, error, saved, and registration states.
- **Do** check stylesheet specificity before documenting or changing field states.

### Don't:

- **Don't** restore the old blue identity from the legacy variable names.
- **Don't** add shadows to ordinary event cards or task panels.
- **Don't** invent event photography, reviews, counts, payment accounts, or QR instructions.
- **Don't** convert registration completion into a claim that payment was approved.

### Event card refinement
Discovery cards use full-bleed API imagery (16:10 in grid), title-first hierarchy, grouped date and venue/province, category beside race tags, and a stacked price beside a dark ink action with lime text. Card body padding is 22px desktop and 20px mobile; titles are 20px desktop and 19px mobile. Uploaded image padding is removed only inside event cards. List view preserves its compact image height and fills the full available width. Existing tokens, save state, event data and navigation remain authoritative.


### Navigation refinement
Desktop navigation aligns right opposite the brand within the shared container, with a 76px header and lime 2px current-page underline. The removed saved-events header action stays absent. At 1020px and below the header is 68px; the mobile menu uses 52px rows, an ink panel, and a green current-page surface. Menu toggling, Escape dismissal and focus return preserve existing behavior.


### Event card interaction update
The entire event card is now one keyboard-focusable link, without nested controls or favorites. Grid cover images use 16:9; a 54px date stamp supports scanning beside the full date and venue/province. Status sits near the price, with category/race tags above. The trailing details affordance uses lime with dark text. Desktop list cards keep a 300px image column and mobile lists stack. This supersedes the earlier card refinement description.


### Catalogue filters refinement
Category selectors wrap on desktop and form a two-column mobile grid. The search has its own full-width field with an ink submit action; four visibly labelled native filters follow in four desktop or two mobile columns. The filter surface uses #edf1e7, 24px desktop or 16px mobile padding, and existing semantic field borders. URL-backed selections, result announcements and clear-filter behavior are preserved.


### Single search entry
Home hero search is removed by user request. Catalogue search and filters are the sole discovery controls. Hero height is 460px desktop, 500px above 1600px, and 360px mobile, with no reserved search space.


### Activities layout refactor
Removed the redundant home quick-guide strip. Catalogue category controls and the collapsed filter toggle share one desktop toolbar. The filter panel is controlled by a button with aria-expanded/aria-controls and hidden state; closing it preserves selections and shows the active count. Mobile categories occupy a single four-column row, then the filter toggle; result count, sorting and view controls share a compact row. Catalogue headings, cards and supporting guide retain the shared container alignment. Tested at 390px, 768px and desktop widths, including empty filtering and clearing.


### Navbar and hero composition
Navbar is 72px desktop and 68px mobile, with a green selected-page surface. Desktop hero uses an ink text ground and runner image beginning at 38% width, blended at the join; hero min-height is 490px. Mobile image fills the hero, copy sits below the visible runner faces, and hero min-height is 440px. A lime anchor to #discover provides a direct path to the catalogue without duplicating search. Existing image and reduced-motion behavior are preserved.


### Event detail refinement
The event title and status precede the image/registration layout. Uploaded detail imagery is full bleed at 16:10; only the API image is used. Registration summary has a heading and one date entry, with no redundant summary date. Desktop sidebar remains sticky; below 900px the image, registration summary, tabs and active panel stack in that visual order. Mobile summary facts use two columns. Existing tabs, race action, registration route and calendar link remain.


### Race option layout
Race options separate distance and per-person price in a shared header, followed by two labelled fact columns for start time and remaining places with total capacity. White borderless 14px surfaces follow the event card system. Availability caveat is plain supporting text. Real event values and the existing remaining/quota fallback are unchanged.


### Typed event media
Event detail overview renders sorted image groups for poster, route_map, shirt, medal, gallery, sponsor, extra covers and other/unknown kinds. The primary cover remains above tabs and is not repeated. Empty groups are omitted. Documentary images use contain and full-size links; gallery thumbnails use 4:3 crops. Images lazy-load, have alt descriptions, a load-error fallback and labelled new-tab full-size links. Desktop uses two columns except posters/maps; mobile stacks. Live QA event verified with two secondary gallery images; all kinds covered by rendering regression tests.

