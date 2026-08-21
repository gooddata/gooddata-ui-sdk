// (C) 2026 GoodData Corporation

import { type DeclarativeParameter, type StringParameterDefinition } from "@gooddata/api-client-tiger";

/**
 * A parameter AAC can represent as code. Only textual parameters are supported, so anything else
 * has to stay under whatever tool created it.
 *
 * @public
 */
export type DeclarativeStringParameter = DeclarativeParameter & { content: StringParameterDefinition };

/** @public */
export function isDeclarativeStringParameter(
    parameter: DeclarativeParameter,
): parameter is DeclarativeStringParameter {
    return parameter.content.type === "STRING";
}

/** Same keys, each narrowed to its defined type — what remains after dropping undefined values. */
type DefinedValues<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

/**
 * Spreadable `constraints` entry for a parameter definition: present only when at least one
 * restriction is set, and never carrying a key whose value is undefined.
 */
export function optionalConstraints<T extends object>(constraints: T): { constraints?: DefinedValues<T> } {
    const defined = Object.fromEntries(
        Object.entries(constraints).filter(([, value]) => value !== undefined),
    ) as DefinedValues<T>;

    return Object.keys(defined).length === 0 ? {} : { constraints: defined };
}

/** An allowed value as authored: `title` is optional and defaults to `value`, so it is only carried when set. */
export function toAllowedValue({ value, title }: { value: string; title?: string }): {
    value: string;
    title?: string;
} {
    return title === undefined ? { value } : { value, title };
}
