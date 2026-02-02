// (C) 2025-2026 GoodData Corporation

import { barrelFiles } from "./configurations/barrel-files.js";
import { browserEnv } from "./configurations/browser-env.js";
import { chaiFriendly } from "./configurations/chai-friendly.js";
import { cypress } from "./configurations/cypress.js";
import { env } from "./configurations/env.js";
import { eslint } from "./configurations/eslint.js";
import { esm } from "./configurations/esm.js";
import { header } from "./configurations/header.js";
import { ignore } from "./configurations/ignore.js";
import { importEsm } from "./configurations/import-esm.js";
import { importX } from "./configurations/import-x.js";
import { jsdoc } from "./configurations/jsdoc.js";
import { noOnlyTests } from "./configurations/no-only-tests.js";
import { oxfmt } from "./configurations/oxfmt.js";
import { prettier } from "./configurations/prettier.js";
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
    barrelFiles,
    importX,
    jsdoc,
    noOnlyTests,
    regexp,
    sonarjs,
    // tsdoc,
    security,
    ignore,
];

// please note, if you modify keys in the following array, please run `npm run update-package` in addition to `npm run build`
const baseVariants: Record<string, IDualConfiguration[]> = {
    browser: [browserEnv], // for any packages that uses document, but are not react libs
    "browser-esm": [browserEnv, esm, importEsm], // unsure if needed
    vitest: [vitest, prettier],
    esm: [esm, importEsm], // used for this lib
    "esm-vitest": [esm, importEsm, vitest], // for @gooddata/util and MAQL language server
    react: [browserEnv, esm, react, reactHooks], // for skel tsx
    "react-vitest": [browserEnv, esm, react, reactHooks, vitest], // for gdc-ui libs
    "react-cypress": [browserEnv, esm, react, reactHooks, cypress, chaiFriendly], // for sdk-ui-tests, and probably gdc-ui
    "esm-react": [browserEnv, esm, react, reactHooks, importEsm], // for most react libs
    "esm-react-cypress": [browserEnv, esm, react, reactHooks, importEsm, cypress, chaiFriendly], // probably unused
    "esm-react-vitest": [browserEnv, esm, react, reactHooks, importEsm, vitest], // for most sdk react libs with vitest
    "esm-react-vitest-storybook": [browserEnv, esm, react, reactHooks, importEsm, vitest, storybook], // for sdk-ui-tests
};

export const commonVariants: Record<string, IDualConfiguration[]> = {
    ...Object.fromEntries(
        Object.entries(baseVariants).map(([name, configurations]) => [name, [...configurations, prettier]]),
    ),
    prettier: [prettier],
};

export const v8Variants: Record<string, IDualConfiguration[]> = { ...commonVariants };
export const v9Variants: Record<string, IDualConfiguration[]> = {
    ...commonVariants,
    ...Object.fromEntries(
        Object.entries(baseVariants).map(([name, configurations]) => [
            [`oxfmt-${name}`],
            [...configurations, oxfmt],
        ]),
    ),
    oxfmt: [oxfmt],
};
