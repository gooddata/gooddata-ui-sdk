// (C) 2025-2026 GoodData Corporation

import { browserEnv } from "./configurations/browser-env.js";
import { chaiFriendly } from "./configurations/chai-friendly.js";
import { cypress } from "./configurations/cypress.js";
import { env } from "./configurations/env.js";
import { eslint } from "./configurations/eslint.js";
import { esm } from "./configurations/esm.js";
import { formatter } from "./configurations/formatter.js";
import { header } from "./configurations/header.js";
import { ignore } from "./configurations/ignore.js";
import { importEsm } from "./configurations/import-esm.js";
import { importX } from "./configurations/import-x.js";
import { jsdoc } from "./configurations/jsdoc.js";
import { noBarrelFiles } from "./configurations/no-barrel-files.js";
import { noOnlyTests } from "./configurations/no-only-tests.js";
import { reactHooks } from "./configurations/react-hooks.js";
import { react } from "./configurations/react.js";
import { regexp } from "./configurations/regexp.js";
import { security } from "./configurations/security.js";
import { sonarjs } from "./configurations/sonarjs.js";
import { storybook } from "./configurations/storybook.js";
import { typescript } from "./configurations/typescript.js";
import { vitest } from "./configurations/vitest.js";
import { type IDualConfiguration } from "./types.js";

export const commonConfigurations: IDualConfiguration[] = [
    env,
    eslint,
    header,
    typescript,
    noBarrelFiles,
    importX,
    jsdoc,
    regexp,
    sonarjs,
    // tsdoc,
    security,
    ignore,
    formatter,
];

// please note, if you modify keys in the following array, please run `npm run update-package` in addition to `npm run build`
export const commonVariants: Record<string, IDualConfiguration[]> = {
    browser: [browserEnv], // for any packages that uses document, but are not react libs
    "browser-esm": [browserEnv, esm, importEsm], // unsure if needed
    vitest: [vitest, noOnlyTests],
    esm: [esm, importEsm], // used for this lib
    "esm-vitest": [esm, importEsm, vitest, noOnlyTests], // for @gooddata/util and MAQL language server
    react: [browserEnv, esm, react, reactHooks], // for skel tsx
    "react-vitest": [browserEnv, esm, react, reactHooks, vitest, noOnlyTests], // for gdc-ui libs
    "react-cypress": [browserEnv, esm, react, reactHooks, cypress, chaiFriendly, noOnlyTests], // for sdk-ui-tests, and probably gdc-ui
    "esm-react": [browserEnv, esm, react, reactHooks, importEsm], // for most react libs
    "esm-react-cypress": [browserEnv, esm, react, reactHooks, importEsm, cypress, chaiFriendly, noOnlyTests], // probably unused
    "esm-react-vitest": [browserEnv, esm, react, reactHooks, importEsm, vitest, noOnlyTests], // for most sdk react libs with vitest
    "esm-react-vitest-storybook": [
        browserEnv,
        esm,
        react,
        reactHooks,
        importEsm,
        vitest,
        noOnlyTests,
        storybook,
    ], // for sdk-ui-tests
};

export const v8Variants = { ...commonVariants };
export const v9Variants = { ...commonVariants };
