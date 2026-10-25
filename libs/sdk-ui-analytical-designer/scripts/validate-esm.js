// (C) 2026 GoodData Corporation

import { register } from "node:module";

// Bundlers load the CSS and image files that the package imports. The hooks do the same in Node.
register("./validate-esm-hooks.js", import.meta.url);

await import("@gooddata/sdk-ui-analytical-designer");
await import("@gooddata/sdk-ui-analytical-designer/internal");
