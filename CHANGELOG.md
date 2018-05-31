# Changelog

<a name="6.0.0"></a>
## 2018-05-11 Version [6.0.0](https://github.com/gooddata/gooddata-js/compare/v5.0.1...v6.0.0)

- renamed package to `@gooddata/gooddata-js` ([commit](https://github.com/gooddata/gooddata-js/commit/367ad67))
- rewritten in TypeScript + merged `@gooddata/data-layer` package ([commit](https://github.com/gooddata/gooddata-js/commit/c5c985e))
- added support for multiple domains, see [documentation](https://sdk.gooddata.com/gooddata-ui/docs/ht_render_visualization_from_different_domain.html) ([commit](https://github.com/gooddata/gooddata-js/commit/ebcebe5))
- internal telemetry support ([commit](https://github.com/gooddata/gooddata-js/commit/76e22f5))

**Migration guide:**

Default SDK instance is no longer returned as the only `module.export` ([see commit](https://github.com/gooddata/gooddata-js/commit/ebcebe#diff-5fdc9336695bd0fbfa5729ca90862b69L13)).

- To get default instance use \
   in CommonJS: `const gooddata = require('@gooddata/gooddata-js').default` \
   or in ES6: `import gooddata from '@gooddata/gooddata-js'`
- DataLayer was merged into gooddata-js as named export. Use: \
   in CommonJS: `const DataLayer = require('@gooddata/gooddata-js').DataLayer` \
   or in ES6: `import { DataLayer } from '@gooddata/gooddata-js'`
- See [all named exports here](https://github.com/gooddata/gooddata-js/blob/v6.0.0/src/gooddata-browser.ts#L13-L28) or in `gooddata-node.ts`

