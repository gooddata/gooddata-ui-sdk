// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import url from "url";
import includes from "lodash/includes";
import { TargetBackendType } from "../types";

const InvalidHostnameMessage =
    "Invalid hostname. Please provide a valid hostname in format [[https|http]://]host[:port]";

export type InputValidator = (value: string) => boolean | string;

export function createHostnameValidator(backend: TargetBackendType) {
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

export function validOrDie(inputName: string, value: string, validator: InputValidator): void {
    const result = validator(value);

    if (typeof result === "string") {
        throw new InputValidationError(inputName, value, result);
    }

    if (!result) {
        throw new InputValidationError(inputName, value, `Invalid value provided: ${value}`);
    }
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
