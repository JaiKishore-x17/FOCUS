# Muon Silver Design System

### 1. Overview & Creative North Star
**Creative North Star: "The Digital Obsidian Vault"**

Muon Silver is a design system rooted in technical prestige and high-end editorial clarity. It rejects the "app-like" interface in favor of a cinematic, architectural experience. The system is defined by extreme typographic tracking, luxurious whitespace, and a "Glass-on-Glass" layering strategy that suggests physical depth through transparency rather than artificial decoration.

The system breaks standard grids through **intentional rotation and stacking**. Elements are not just placed; they are layered as if they were physical sheets of semi-transparent polycarbonate, creating a sense of sophisticated security and elite access.

### 2. Colors
The palette is hyper-minimalist, focusing on **Carbon (#111318)** and **Silver (#C0C0C0)**.

*   **The "No-Line" Rule:** Sectioning is achieved through variations in surface luminosity or backdrop blurs. 1px solid borders are strictly prohibited for layout divisions.
*   **Surface Hierarchy:** 
    *   **Surface Lowest:** Pure white base.
    *   **Surface Container:** Glass-morphic layers with `backdrop-filter: blur(20px)` and 40-60% opacity.
*   **The Glass & Gradient Rule:** Floating interaction points must use `rgba(255, 255, 255, 0.4)` backgrounds. Signature elements (like the biometric scanner) utilize a **Metallic Gradient** (from `#e6e6e6` to `#8e8e8e`) to evoke hardware-grade materials.

### 3. Typography
The system uses **Inter** across all roles, but differentiates through extreme weight and tracking variations.

*   **Display (60px / 3.75rem):** Ultralight (200 weight), 0.25em letter-spacing. Used for branding and primary impact.
*   **Hero Labels (10px - 12px):** Extrabold (800 weight), 0.3em to 0.5em letter-spacing. This creates an "instrumentation" aesthetic found in high-end watchmaking or aerospace interfaces.
*   **Vault Titles (20px / 1.25rem):** Extrabold, 0.2em letter-spacing, uppercase.
*   **Body/Subtext (11px):** Medium weight, wide tracking, low opacity (40%).

### 4. Elevation & Depth
Depth is the primary communicator of hierarchy in Muon Silver.

*   **The Layering Principle:** Instead of standard shadows, we use **Stacking Offsets**. A primary container is often accompanied by 1-2 "ghost" layers behind it, rotated by 3-6 degrees and translated slightly.
*   **Ambient Shadows:** We utilize a custom soft shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.05)`. It is barely perceptible, serving to lift the glass layers off the white background.
*   **Inner Shadows:** High-touch interaction points (buttons) use an **Inner Shadow** to create a "pressed" or "milled" effect into the glass surface.

### 5. Components
*   **Biometric Buttons:** Large, circular elements (80px) with a `white/50` backdrop blur and a metallic-icon gradient. They should feel like physical hardware.
*   **Glass Cards:** Large border-radius (40px-50px) with high blur values. These are used to house critical information "Vaults."
*   **Manual Overrides:** Text-only buttons using 10px Extrabold caps. They should feel secondary but technically precise.
*   **Dividers:** Minimalist 48px wide, 1px tall bars with 10% opacity. Never full-width.

### 6. Do's and Don'ts
*   **Do:** Use extreme letter-spacing for all uppercase text.
*   **Do:** Use multiple stacked, rotated glass layers to create visual interest in hero sections.
*   **Do:** Maintain a high "Ink-to-White-Space" ratio.
*   **Don't:** Use standard blue or colorful primary buttons; stick to Carbon or Silver metallic effects.
*   **Don't:** Use standard 12pt body text. All labels should be very small/bold or very large/light.
*   **Don't:** Use sharp corners; the system relies on "Super-ellipses" and high roundedness (40px+).