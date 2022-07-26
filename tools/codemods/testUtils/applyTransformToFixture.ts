// (C) 2022 GoodData Corporation
import { readFileSync } from "node:fs";

// adapted from https://github.com/facebook/jscodeshift/blob/352e7b677abe11f8600283f3ae97cebaef526842/src/testUtils.js#L15-L37
// until https://github.com/facebook/jscodeshift/pull/515 is merged and released
function applyTransform(module: any, options: any, input: { source: string }, testOptions: any = {}) {
    // Handle ES6 modules using default export for the transform
    const transform = module.default ? module.default : module;

    // Jest resets the module registry after each test, so we need to always get
    // a fresh copy of jscodeshift on every test run.
    let jscodeshift = require("jscodeshift/dist/core"); // eslint-disable-line @typescript-eslint/no-var-requires
    if (testOptions.parser || module.parser) {
        jscodeshift = jscodeshift.withParser(testOptions.parser || module.parser);
    }

    const output = transform(
        input,
        {
            jscodeshift,
            j: jscodeshift,
            stats: () => {
                /* do nothing */
            },
            report: () => {
                /* do nothing */
            },
        },
        options || {},
    );

    return (output || "").trim();
}

export function applyTransformToFixture(transform: any, fixturePath: string): string {
    const input = readFileSync(fixturePath, { encoding: "utf8" });
    return applyTransform(transform, { parser: "tsx" }, { source: input });
}
