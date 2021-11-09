// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import url from "url";
import includes from "lodash/includes";
import { TargetBackendType } from "../types";
import axios, { AxiosError } from "axios";
import { IAnalyticalBackend, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { extractRootCause } from "../utils";

export type InputValidator = (value: string) => boolean | string;
export type AsyncInputValidator = (value: string) => Promise<boolean | string>;

//
// Simple validators compatible with inquirer API
//

/**
 * Validates that plugin name matches required regex.
 */
export function pluginNameValidator(value: string): boolean | string {
    if (!value.match(/^[a-zA-Z0-9_\-@/]*$/)) {
        return "Invalid plugin name. Use only alphanumerical characters, underscores and dashes.";
    }

    return true;
}

/**
 * Validates that value is either 'bear' or 'tiger'.
 *
 * @param value
 */
export function backendTypeValidator(value: string): boolean | string {
    if (value === "bear" || value === "tiger") {
        return true;
    }

    return "Invalid backend type. Specify 'bear' for GoodData Platform or 'tiger' for GoodData.CN.";
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
 * Validates that value is either 'npm' or 'yarn'.
 */
export function packageManagerValidator(value: string): boolean | string {
    if (value === "npm" || value === "yarn") {
        return true;
    }

    return "Invalid package manager. Specify 'npm' or 'yarn'.";
}

//
// More complex validators compatible with the inquirer API
//

/**
 * Factory for hostname validators. Only validates that URL is syntactically correct. Validation depends on
 * the backend type:
 *
 * -  bear backend: only allow https protocol
 * -  tiger backend: allows either http or https
 */
export function createHostnameValidator(backend: TargetBackendType): InputValidator {
    const InvalidHostnameMessage =
        "Invalid hostname. Please provide a valid hostname in format [[https|http]://]host[:port]";

    return (input: string): boolean | string => {
        if (isEmpty(input)) {
            return InvalidHostnameMessage;
        }

        try {
            const { protocol } = url.parse(input);

            if (backend === "bear") {
                if (protocol && protocol !== "https:") {
                    return "Provide hostname with https protocol or no protocol at all. ";
                }
            } else {
                if (protocol && !includes(["http:", "https:"], protocol)) {
                    return "Provide hostname with http or https protocol or no protocol at all.";
                }
            }

            // this will throw in case there is another problem with the URL
            new url.URL(`${protocol ? "" : "https://"}${input}`);

            return true;
        } catch (e: any) {
            return InvalidHostnameMessage;
        }
    };
}

/**
 * Factory for plugin URL validators. The created validator is async:
 *
 * -  verify that the hosting is https
 * -  verify that the URL ends with the plugin entry point file
 * -  verify that GET of the entry point works
 *    -  validator attempts to give some nicer messaging and where possible also provide hints
 */
export function createPluginUrlValidator(pluginIdentifier: string): AsyncInputValidator {
    const entryPoint = `${pluginIdentifier}.js`;

    return async (value: string): Promise<boolean | string> => {
        if (!value.startsWith("https://")) {
            return `Invalid plugin URL. The plugin URL must be for an https location. Example: 'https://your.hosting.com/myPlugin/${entryPoint}'.`;
        }

        if (!value.endsWith(entryPoint)) {
            return `Invalid plugin URL. The plugin URL must point at the plugin entry point. Example: 'https://your.hosting.com/myPlugin/${entryPoint}'.`;
        }

        return axios
            .get(value)
            .then((_) => {
                return true;
            })
            .catch((e: AxiosError) => {
                const { status, statusText } = e.response ?? {};

                if (status && statusText) {
                    const prefix = `Invalid plugin URL (${status} ${statusText}). `;

                    if (status === 404) {
                        return prefix + "Looks like the plugin is not available on the hosting.";
                    } else if (status === 401) {
                        return (
                            prefix +
                            "Host requires authentication to access plugin. Plugins must be hosted publicly, " +
                            "without need for authentication."
                        );
                    } else if (status === 403) {
                        return (
                            prefix +
                            "Host requires authorization to access plugin. Note that in some hosting configuration " +
                            "this is just a 404 in disguise and the plugin actually does not exist on the host."
                        );
                    }

                    return prefix + "Please check hosting is setup correctly.";
                }

                return `An error has occurred while validating plugin URL: ${e.message}`;
            });
    };
}

/**
 * Factory for workspace validators. The created validator is async and verifies that the workspace
 * actually exists on the backend.
 */
export function createWorkspaceValidator(backend: IAnalyticalBackend): AsyncInputValidator {
    return async (value): Promise<boolean | string> => {
        if (isEmpty(value)) {
            return "Invalid workspace. Specify a valid workspace identifier.";
        }

        // TODO: see FET-902; we should use getDescriptor() here.
        return backend
            .workspace(value)
            .dashboards()
            .getDashboards()
            .then((_) => {
                return true;
            })
            .catch((e: any) => {
                if (isUnexpectedResponseError(e)) {
                    if (e.httpStatus === 404) {
                        return `Workspace ${value} does not exist on ${backend.config.hostname}.`;
                    } else if (e.httpStatus === 403) {
                        return `Workspace ${value} does exist but you do not have authorization.`;
                    }
                }

                const rootCause = extractRootCause(e);

                return `An error has occurred while validating workspace existence: ${rootCause.message}`;
            });
    };
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
 * @param inputName name of input that is being validated - this is purely metadata, passed over to the exception
 *  so that whoever gets hold of it can determine what exactly failed validation.
 * @param value value to validate; this will be sent to the validator function & in case of failure will also
 *  appear in the exception
 * @param validator validator to use, this is function matching the contract set by the inquirer library
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

/**
 * This error is thrown when input validation fails.
 */
export class InputValidationError extends Error {
    public readonly type = "IVE";

    public constructor(public readonly inputName: string, public readonly value: string, message: string) {
        super(message);

        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Type guard testing whether object is a type of {@link InputValidationError}.
 */
export function isInputValidationError(obj: unknown): obj is InputValidationError {
    return obj && (obj as InputValidationError).type === "IVE";
}
