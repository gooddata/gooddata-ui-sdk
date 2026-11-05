// (C) 2025-2026 GoodData Corporation

import { commonConfigurations, flatVariants, legacyVariants } from "../src/index.js";

import { buildFlat, eslintMajors } from "./build/flat.js";
import { buildLegacy } from "./build/legacy.js";

// Build legacy eslintrc JSON configs
buildLegacy(commonConfigurations, legacyVariants);

for (const major of eslintMajors) {
    // Build flat config JS files
    buildFlat(commonConfigurations, flatVariants, major);

    // Build flat config JS files for OxLint partial migration
    buildFlat(commonConfigurations, flatVariants, major, true);
}
