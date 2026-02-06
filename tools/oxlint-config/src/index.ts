// (C) 2025-2026 GoodData Corporation

import { browserEnv } from "./configurations/browser-env.js";
import { chaiFriendly } from "./configurations/chai-friendly.js";
import { cypress } from "./configurations/cypress.js";
import { env } from "./configurations/env.js";
import { eslint } from "./configurations/eslint.js";
import { headers } from "./configurations/headers.js";
import { importEsm } from "./configurations/import-esm.js";
import { importX } from "./configurations/import-x.js";
import { noBarrelFiles } from "./configurations/no-barrel-files.js";
import { noOnlyTests } from "./configurations/no-only-tests.js";
import { oxc } from "./configurations/oxc.js";
import { security } from "./configurations/security.js";
import { sonarjs } from "./configurations/sonarjs.js";
import { typescript } from "./configurations/typescript.js";
import { type IConfiguration } from "./types.js";

export const common: IConfiguration[] = [
    env,
    oxc,
    eslint,
    headers,
    typescript,
    noBarrelFiles,
    importX,
    sonarjs,
    security,
];

// please note, if you modify keys in the following array, please run `npm run update-package` in addition to `npm run build`
export const variants: Record<string, IConfiguration[]> = {
    browser: [browserEnv], // for any packages that uses document, but are not react libs
    "browser-esm": [browserEnv, importEsm], // unsure if needed
    vitest: [noOnlyTests],
    esm: [importEsm], // used for this lib
    "esm-vitest": [importEsm, noOnlyTests], // for @gooddata/util and MAQL language server
    react: [browserEnv], // for skel tsx
    "react-vitest": [browserEnv, noOnlyTests], // for gdc-ui libs
    "react-cypress": [browserEnv, cypress, chaiFriendly, noOnlyTests], // for sdk-ui-tests, and probably gdc-ui
    "esm-react": [browserEnv, importEsm], // for most react libs
    "esm-react-cypress": [browserEnv, importEsm, cypress, chaiFriendly, noOnlyTests], // probably unused
    "esm-react-vitest": [browserEnv, importEsm, noOnlyTests], // for most sdk react libs with vitest
    "esm-react-vitest-storybook": [browserEnv, importEsm, noOnlyTests], // for sdk-ui-tests
};
