// (C) 2025 GoodData Corporation

import {
    browserEnv,
    chaiFriendly,
    cypress,
    env,
    eslint,
    eslintComments,
    esm,
    gooddata,
    header,
    ignore,
    importEsm,
    import_,
    noOnlyTests,
    prettier,
    react,
    reactHooks,
    regexp,
    security,
    sonarjs,
    storybook,
    tsdoc,
    typescript,
    vitest,
} from "./configurations/index.js";

export const common = [
    env,
    eslint,
    header,
    typescript,
    import_,
    noOnlyTests,
    prettier,
    regexp,
    sonarjs,
    tsdoc,
    eslintComments,
    gooddata,
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
