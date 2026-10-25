// (C) 2007-2026 GoodData Corporation

import { IS_DEBUG } from "../../buildParams.js";

function _logError(message?: unknown, ...optionalParameters: unknown[]) {
    let caller = "";

    const e = new Error("forcing stack");
    const stack: string = e.stack;
    caller = stack.split("\n")?.[2];
    caller = caller.replace(" at ", "").trim();
    caller = `[${caller}]`;

    console.error(`${caller} - ${message}`, optionalParameters);
}

let logError: typeof _logError = () => {};

if (IS_DEBUG) {
    logError = _logError;
}

export { logError };
