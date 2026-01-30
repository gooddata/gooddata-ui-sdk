// (C) 2025-2026 GoodData Corporation

import gooddata from "./dist/esm.js";
import { tsOverride } from "./src/utils/tsOverride.js";

export default [...gooddata, tsOverride(import.meta.dirname)];
