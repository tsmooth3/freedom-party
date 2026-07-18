## Question

Which modern, maintainable, and Svelte 5-native styling/UI strategy should replace the legacy Skeleton.dev components and layouts to improve long-term maintainability and performance?

---

## Resolution (Closed)

We have decided on **Option A: Pure Tailwind CSS + Custom Svelte 5 Runes Components**. This approach provides zero external UI library dependencies, optimal long-term maintainability, and exceptional runtime performance.

### 1. Framework Decisions
- **Styling Core**: Tailwind CSS (v3 or v4) with custom utility styles.
- **Dependency Purge**: Complete removal of `@skeletonlabs/skeleton` and `@skeletonlabs/tw-plugin`.
- **Custom Svelte 5 Runes Components**:
  - `<Accordion>`: Lightweight accordion component utilizing Svelte 5 `$state` and `$props`.
  - `<Stepper>`: Step-by-step layout flow for setup wizards using simple Svelte 5 states.
  - `<Table>`: Clean HTML table components styled with Tailwind CSS.
- **Theme & Aesthetic**: Move to a clean, modern aesthetic with high-contrast light/dark designs (similar to modern Tailwind UI / Tailwind CSS designs).
- **Dark Mode**: Standard button-style icon toggle (sun/moon) managing a simple state that toggles the `.dark` class on the `<html>` or `<body>` element.
