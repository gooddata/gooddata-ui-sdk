// (C) 2026 GoodData Corporation

import { register } from "module";

// Bundlers load the Monaco CSS and worker URLs that the package imports. The hooks do the same in Node.
register("./validate-esm-hooks.js", import.meta.url);

await import("@gooddata/sdk-ui-metric-component");

// The hooks stub MaqlEditorEditor, so import what only it reaches.
await import("../esm/MetricComponent/Form/MaqlEditorField/MaqlEditorField.events.js");
await import("../esm/MetricComponent/Form/MaqlEditorField/suggestionDetailsFunctions.js");
await import("../esm/MetricComponent/Form/MaqlEditorUtils/Placeholder.js");
