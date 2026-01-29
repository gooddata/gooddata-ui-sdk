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
import { import_ } from "./configurations/import.js";
import { jsdoc } from "./configurations/jsdoc.js";
import { noOnlyTests } from "./configurations/no-only-tests.js";
import { prettier } from "./configurations/prettier.js";
import { reactHooks } from "./configurations/react-hooks.js";
import { react } from "./configurations/react.js";
import { regexp } from "./configurations/regexp.js";
import { security } from "./configurations/security.js";
import { sonarjs } from "./configurations/sonarjs.js";
import { storybook } from "./configurations/storybook.js";
import { tsdoc } from "./configurations/tsdoc.js";
import { typescript } from "./configurations/typescript.js";
import { vitest } from "./configurations/vitest.js";

export const common = [
    env,
    eslint,
    header,
    typescript,
    barrelFiles,
    import_,
    jsdoc,
    noOnlyTests,
    prettier,
    regexp,
    sonarjs,
    tsdoc,
    security,
    ignore,
];

// please note, if you modify keys in the following array, please run `npm run update-package` in addition to `npm run build`
export const variants = {
    browser: [browserEnv], // for any packages that uses document, but are not react libs
    "browser-esm": [browserEnv, esm, importEsm], // unsure if needed
    vitest: [vitest],
    esm: [esm, importEsm], // for when we convert MAQL language server to ESM
    "esm-vitest": [esm, importEsm, vitest], // for @gooddata/util
    react: [browserEnv, esm, react, reactHooks], // for skel tsx
    "react-vitest": [browserEnv, esm, react, reactHooks, vitest], // for gdc-ui libs
    "react-cypress": [browserEnv, esm, react, reactHooks, cypress, chaiFriendly], // for sdk-ui-tests, and probably gdc-ui
    "esm-react": [browserEnv, esm, react, reactHooks, importEsm], // for most react libs
    "esm-react-cypress": [browserEnv, esm, react, reactHooks, importEsm, cypress, chaiFriendly], // probably unused
    "esm-react-vitest": [browserEnv, esm, react, reactHooks, importEsm, vitest], // for most sdk react libs with vitest
    "esm-react-vitest-storybook": [browserEnv, esm, react, reactHooks, importEsm, vitest, storybook], // for sdk-ui-tests
};
