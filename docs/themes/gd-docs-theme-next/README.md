## gd-docs-theme-next

Hugo theme for GoodData documentation. Provides the base layouts, styles, and components
for the GoodData.UI docs site.

**This directory is the theme's only copy — edit it here.** gdc-ui ships it, so `sdk/docs`
picks it up through classic `theme = ["gd-docs-theme-next"]` with no module wiring, and a
change is live as soon as it lands. There is deliberately no second copy to keep in sync;
see [INTEGRATION.md](./INTEGRATION.md) §0 for why.

Other sites import it as a Hugo module (`github.com/gooddata/gd-docs-theme-next`, declared
in `go.mod`) mapped onto this path with `replacements` — INTEGRATION.md §1. The module path
is inert for gdc-ui's own build.

Unit tests for the theme's client-side JS live in `tests/` and run with
`npm test` from `sdk/docs`.
