// (C) 2007-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { InputValidationError } from "../types.js";

export type InputValidator<T = string> = (value: T) => boolean | string;
export type AsyncInputValidator = (value: string) => Promise<boolean | string>;

//
// Simple validators compatible with inquirer API
//

/**
 * Validates that application name matches required regex.
 */
export function applicationNameValidator(value: string): boolean | string {
    if (isEmpty(value) || (value && isEmpty(value.trim()))) {
        return "Please enter non-empty application name.";
    }

    // pattern used by VS code:
    if (!value.match(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/)) {
        return "Invalid application name. Application name must be a valid package name.";
    }

    if (value.length > 214) {
        return "Invalid application name. Name is too long.";
    }

    return true;
}

/**
 * Validates that value is either 'js' or 'ts'.
 */
export function languageValidator(value: string): boolean | string {
    if (value === "js" || value === "ts") {
        return true;
    }

    return "Invalid language. Specify 'ts' for TypeScript or 'js' for JavaScript.";
}

/**
 * Validates that the value is supported template.
 */
export function templateValidator(value: string): boolean | string {
    if (value === "react-app") {
        return true;
    }

    return "Invalid template. Specify a supported template. (e.g. react-app)";
}

/**
 * Validates that value is either 'npm' or 'yarn'.
 */
export function packageManagerValidator(value: string): boolean | string {
    if (value === "npm" || value === "yarn") {
        return true;
    }

    return "Invalid package manager. Specify 'npm' or 'yarn'.";
}

//
// Functions to trigger validation outside of inquirer.
//

/**
 * Triggers validation of value for particular input, using the provided validator. If the validation
 * succeeds (validator returns true), then this function just returns.
 *
 * Otherwise the function throws an {@link InputValidationError}.
 *
 * @param inputName - name of input that is being validated - this is purely metadata, passed over to the exception
 *  so that whoever gets hold of it can determine what exactly failed validation.
 * @param value - value to validate; this will be sent to the validator function & in case of failure will also
 *  appear in the exception
 * @param validator - validator to use, this is function matching the contract set by the inquirer library
 */
export function validOrDie(inputName: string, value: string, validator: InputValidator): void {
    const result = validator(value);

    if (typeof result === "string") {
        throw new InputValidationError(inputName, value, result);
    }

    if (!result) {
        throw new InputValidationError(inputName, value, `Invalid value provided: ${value}`);
    }
}

/**
 * This is same as {@link validOrDie} except that the validator function returns Promise of the validation
 * result.
 *
 * See {@link validOrDie} for more detail.
 */
export function asyncValidOrDie(
    inputName: string,
    value: string,
    validator: AsyncInputValidator,
): Promise<void> {
    return validator(value).then((result) => {
        if (typeof result === "string") {
            throw new InputValidationError(inputName, value, result);
        }

        if (!result) {
            throw new InputValidationError(inputName, value, `Invalid value provided: ${value}`);
        }
    });
}
