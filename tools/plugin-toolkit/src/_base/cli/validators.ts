// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import url from "url";
import includes from "lodash/includes";
import { TargetBackendType } from "../types";
import axios, { AxiosError } from "axios";

const InvalidHostnameMessage =
    "Invalid hostname. Please provide a valid hostname in format [[https|http]://]host[:port]";

export type InputValidator = (value: string) => boolean | string;
export type AsyncInputValidator = (value: string) => Promise<boolean | string>;

export function createHostnameValidator(backend: TargetBackendType): InputValidator {
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

export function pluginNameValidator(value: string): boolean | string {
    if (!value.match(/^[a-zA-Z0-9_\-@/]*$/)) {
        return "Invalid plugin name. Use only alphanumerical characters, underscores and dashes.";
    }

    return true;
}

export function createPluginUrlValidator(pluginIdentifier: string): AsyncInputValidator {
    const entryPoint = `${pluginIdentifier}.js`;
    return async (value: string): Promise<boolean | string> => {
        if (!value.startsWith("https://")) {
            return "Invalid plugin URL. The plugin URL must be for an https location. Example: 'https://your.hosting.com/myPlugin/${entryPoint}'.";
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
                            "Host requires authentication to access plugin. Plugins must be hosted publicly, without need for authentication."
                        );
                    } else if (status === 403) {
                        return (
                            prefix +
                            "Host requires authorization to access plugin. Note that in some hosting configuration this is just a 404 in disguise and the plugin actually does not exist on the host."
                        );
                    }

                    return prefix + "Please check hosting is setup correctly.";
                }

                return `An error has occurred while validating plugin URL: ${e.message}`;
            });
    };
}

export function backendTypeValidator(value: string): boolean | string {
    if (value === "bear" || value === "tiger") {
        return true;
    }

    return "Invalid backend type. Specify 'bear' for GoodData Platform or 'tiger' for GoodData.CN.";
}

export function languageValidator(value: string): boolean | string {
    if (value === "js" || value === "ts") {
        return true;
    }

    return "Invalid language. Specify 'ts' for TypeScript or 'js' for JavaScript.";
}

export function packageManagerValidator(value: string): boolean | string {
    if (value === "npm" || value === "yarn") {
        return true;
    }

    return "Invalid package manager. Specify 'npm' or 'yarn'.";
}

export function workspaceValidator(value: string): boolean | string {
    // TODO: make this more strict
    if (!isEmpty(value)) {
        return true;
    }

    return "Invalid workspace. Specify a valid workspace identifier.";
}

export function validOrDie(inputName: string, value: string, validator: InputValidator): void {
    const result = validator(value);

    if (typeof result === "string") {
        throw new InputValidationError(inputName, value, result);
    }

    if (!result) {
        throw new InputValidationError(inputName, value, `Invalid value provided: ${value}`);
    }
}

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

export class InputValidationError extends Error {
    public readonly type = "IVE";

    public constructor(public readonly inputName: string, public readonly value: string, message: string) {
        super(message);

        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export function isInputValidationError(obj: unknown): obj is InputValidationError {
    return obj && (obj as InputValidationError).type === "IVE";
}
