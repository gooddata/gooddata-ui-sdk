// (C) 2025-2026 GoodData Corporation

import { chaiFriendly } from "./configurations/chai-friendly.js";
import { correctness } from "./configurations/correctness.js";
import { eslint } from "./configurations/eslint.js";
import { oxc } from "./configurations/oxc.js";
import { type IConfiguration } from "./types.js";

export const common: IConfiguration[] = [correctness, oxc, eslint];

// please note, if you modify keys in the following array, please run `npm run update-package` in addition to `npm run build`
export const variants: Record<string, IConfiguration[]> = {
    cypress: [chaiFriendly],
};
