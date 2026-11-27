// (C) 2026 GoodData Corporation

import {
    type DateRangeParameterDefinition,
    type DeclarativeParameter,
    type NumberParameterDefinition,
    type StringParameterDefinition,
} from "@gooddata/api-client-tiger";

/**
 * A textual parameter as the declarative API carries it.
 *
 * @public
 */
export type DeclarativeStringParameter = DeclarativeParameter & { content: StringParameterDefinition };

/**
 * A numeric parameter as the declarative API carries it.
 *
 * @public
 */
export type DeclarativeNumberParameter = DeclarativeParameter & { content: NumberParameterDefinition };

/**
 * A date range parameter (a named period) as the declarative API carries it.
 *
 * @public
 */
export type DeclarativeDateRangeParameter = DeclarativeParameter & { content: DateRangeParameterDefinition };

/**
 * A parameter AAC can represent as code: textual, numeric or a date range. Anything else has to stay
 * under whatever tool created it.
 *
 * @public
 */
export type DeclarativeCodeParameter =
    | DeclarativeStringParameter
    | DeclarativeNumberParameter
    | DeclarativeDateRangeParameter;

/** @public */
export function isDeclarativeStringParameter(
    parameter: DeclarativeParameter,
): parameter is DeclarativeStringParameter {
    return parameter.content.type === "STRING";
}

/** @public */
export function isDeclarativeNumberParameter(
    parameter: DeclarativeParameter,
): parameter is DeclarativeNumberParameter {
    return parameter.content.type === "NUMBER";
}

/** @public */
export function isDeclarativeDateRangeParameter(
    parameter: DeclarativeParameter,
): parameter is DeclarativeDateRangeParameter {
    return parameter.content.type === "DATE_RANGE";
}

/** @public */
export function isDeclarativeCodeParameter(
    parameter: DeclarativeParameter,
): parameter is DeclarativeCodeParameter {
    return (
        isDeclarativeStringParameter(parameter) ||
        isDeclarativeNumberParameter(parameter) ||
        isDeclarativeDateRangeParameter(parameter)
    );
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

/**
 * A date range as authored: an open end is left out rather than carried as undefined, and a year written
 * without quotes, which YAML reads as a number, is taken as its text.
 */
export function toDateRangeValue<TGranularity extends string>({
    granularity,
    from,
    to,
}: {
    granularity: TGranularity;
    from?: string | number;
    to?: string | number;
}): { granularity: TGranularity; from?: string; to?: string } {
    return {
        granularity,
        ...(from === undefined ? {} : { from: String(from) }),
        ...(to === undefined ? {} : { to: String(to) }),
    };
}
