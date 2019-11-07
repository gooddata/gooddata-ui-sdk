// (C) 2007-2018 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

/**
 * This is common SDK-land exception. Message either provides description of the problem or a textual
 * status code of the problem.
 *
 * @public
 */
export class RuntimeError extends Error {
    public readonly sdkError: boolean = true;

    constructor(public message: string, public cause?: Error) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }

    public getMessage() {
        return this.message;
    }

    public getCause() {
        return this.cause;
    }
}

/**
 * Typeguard checking whether input is an instance of {@link RuntimeError};
 *
 * @public
 */
export function isSdkError(obj: any): obj is RuntimeError {
    return !isEmpty(obj) && (obj as RuntimeError).sdkError === true;
}
