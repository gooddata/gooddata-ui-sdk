// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [...config, tsOverride(import.meta.dirname)];