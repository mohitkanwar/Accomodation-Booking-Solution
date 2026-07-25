# Discovery presentation deck

`Accommodation-Booking-Solution-Discovery-Presentation.pptx` is the 60-minute
initial-discovery PowerPoint deck, following the same agenda and content as
the Docusaurus site (`docs/index.md` and the pages under `docs/presentation/`).
It uses the Sodexo brand palette and mark from `plantuml/sodexo-theme.puml`
and `static/img/favicon.svg`.

## Regenerating the deck

The deck is built from a script, not hand-edited in PowerPoint, so content
changes should go through the script and be regenerated:

```bash
cd deck/assets
npm install        # first time only — installs pptxgenjs, react-icons, sharp
node render-icons.js  # only needed if you add/change an icon
node build-deck.js
```

This writes `../Accommodation-Booking-Solution-Discovery-Presentation.pptx`.

## Layout

- `assets/build-deck.js` — the deck generator (pptxgenjs). Slide content,
  colors, and layout all live here.
- `assets/render-icons.js` — renders the `react-icons/fi` glyphs used by the
  icon-in-a-circle motif into `assets/icons/*.png`.
- `assets/diagrams/` — images embedded in the deck, rasterized from the site's
  own diagrams (currently the corporate user landscape from
  `docs/presentation/diagrams/users/`).
- `assets/node_modules/`, `assets/package.json` — an isolated toolchain for
  the deck only; not a dependency of the Docusaurus site. `node_modules` is
  git-ignored.

## Content source

Slide content is drawn from: `docs/index.md`, `docs/presentation/context-and-understanding.md`,
`docs/presentation/users.mdx`, `docs/presentation/discovery-questions.md`,
`docs/presentation/data-model.md`, `docs/presentation/domain-models.md`,
`docs/presentation/api-flow.md`, `docs/presentation/architecture-principles.md`,
`docs/presentation/non-functional-requirements.md`, and
`docs/presentation/next-steps-and-workshops.md`. If those pages change, update
`build-deck.js` to match and regenerate.
