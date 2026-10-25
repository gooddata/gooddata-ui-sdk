// (C) 2023-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { isGoodDataSdkError } from "@gooddata/sdk-ui";

import { type IErrorRawData } from "../../typings/report.js";

const RECURSIVE_PARSER_LIMIT = 3;
const TAB = "\t";
const BREAK_LINE = "\n";

const parseValueToTextareaContent = (value: unknown, level: number): string => {
    // To prevent objects from having too many levels, we will limit the depth of the object.
    // Any object data exceeding the depth limit will be converted to a string.
    if (level < RECURSIVE_PARSER_LIMIT) {
        if (Array.isArray(value)) {
            return parseArrayToTextareaContent(value, level + 1);
        }

        if (value !== null && typeof value === "object") {
            return parseObjectTextareaContent(value, level + 1);
        }
    }

    return JSON.stringify(value);
};

const parseArrayToTextareaContent = (arr: unknown[], level: number): string => {
    const tabs = TAB.repeat(level);
    const data = arr.map((value) => {
        const parsedValue = parseValueToTextareaContent(value, level);
        return `${BREAK_LINE}${tabs}${TAB}${parsedValue}`;
    });

    return isEmpty(data) ? "[]" : `[${tabs}${data}${BREAK_LINE}${tabs}]`;
};

const parseObjectTextareaContent = (obj: object, level: number): string => {
    const tabs = TAB.repeat(level);
    const data = Object.entries(obj ?? {}).map(([key, value]) => {
        const parsedValue = parseValueToTextareaContent(value, level);
        return `${BREAK_LINE}${tabs}${TAB}"${key}": ${parsedValue}`;
    });

    return isEmpty(data) ? "{}" : `{${data.join(",")}${BREAK_LINE}${tabs}}`;
};

export const parseRawDataToTextareaContent = (errorRawData: IErrorRawData): string => {
    return parseObjectTextareaContent(errorRawData, 0);
};

export const extractErrorResponseData = (error: unknown) => {
    // the caught error is probed for the axios-ish response fields the error page shows
    const probe = error as
        | { cause?: { responseBody?: unknown; traceId?: string; httpStatus?: number } }
        | undefined;
    const cause = isGoodDataSdkError(error) ? error.getCause() : probe?.cause;
    if (!cause) {
        return null;
    }

    let rawData: IErrorRawData = {};
    try {
        const responseBody = cause.responseBody || {};
        rawData =
            responseBody !== null && typeof responseBody === "object"
                ? (responseBody as IErrorRawData)
                : (JSON.parse(responseBody as string) as IErrorRawData);
    } catch {
        // do nothing
    }

    return {
        traceId: cause.traceId ?? (rawData["traceId"] as string | undefined),
        httpStatus: cause.httpStatus,
        rawData,
    };
};
