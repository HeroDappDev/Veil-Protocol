# Responsive Runoff Prevention

## Goal

Prevent the browser's white canvas from appearing during fast scrolling or overscroll, eliminate accidental horizontal page runoff, and keep every route usable across phones, tablets, laptops, and wide screens.

## Global containment

- Apply the black application background to `html`, `body`, and `#root`.
- Constrain document width and horizontal overflow at the root surfaces.
- Use dynamic viewport minimum heights so mobile browser chrome does not create gaps.
- Add safe defaults for media, tables, preformatted content, and dialogs.
- Preserve vertical scrolling and accessibility; do not disable normal page navigation or zoom.

## Responsive audit

- Review every application route at representative mobile, tablet, laptop, and desktop widths.
- Check headers, navigation, cards, grids, tables, dialogs, long text, and fixed decorative layers.
- Apply page-level corrections only where content genuinely exceeds its viewport.

## Verification

- No white background appears during fast scrolling or overscroll.
- No route creates unintended horizontal document scrolling.
- Core content remains readable and controls remain reachable at all tested widths.
- TypeScript health checks continue to pass.