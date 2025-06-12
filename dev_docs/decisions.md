# Technology & architecture decisions log

This is documentation of various decisions we made during design and development, together with the rationale
behind them.

## Monorepo - Rush vs Lerna / Yarn workspaces

Several reasons:

1.  Rush in conjunction with PNPM construct node_modules the correct way
2.  Product vs toolbox philosophy; Rush comes with an opinion and useful built-in functionality to tackle several
    problems related to managing external dependencies
3.  Good documentation, simple setup

Bottom line is Rush 'just worked' and included all that we needed. We spent very little time fiddling with it and did
not have to deal with very little incidental complexity.

### Rush with PNPM instead of Yarn / NPM

You can read more about package managers in [this article](https://rushjs.io/pages/maintainer/package_managers/).

Also from an honest pragmatic point of view, Rush really only works well with PNPM; its Yarn support is experimental and
while it can work with NPM it needs some ancient version :)

## Layered Architecture

This is typical choice when the requirement is to isolate implementation detail from the domain model. We need
that to support multiple types of backends.
