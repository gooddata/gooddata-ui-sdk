// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { commonConfigurations, v8Variants, v9Variants } from "../src/index.js";
import { buildV8 } from "./build/v8.js";
import { buildV9 } from "./build/v9.js";

// Build v8 eslintrc JSON configs
buildV8(commonConfigurations, v8Variants);

// Build v9 flat config JS files
buildV9(commonConfigurations, v9Variants);

// Copy tsOverride helpers
writeFileSync("dist/tsOverride.cjs", readFileSync("src/utils/tsOverride.cjs"));
writeFileSync("dist/tsOverride.js", readFileSync("src/utils/tsOverride.js"));
writeFileSync("dist/tsOverride.d.ts", readFileSync("src/utils/tsOverride.d.ts"));
