// (C) 2023-2026 GoodData Corporation

import type {
    ArithmeticMetricField,
    AttributeField,
    Bucket,
    CalculatedMetricField,
    ComplexBucket,
    Dataset,
    Field,
    InlineMetricField,
    MetricField,
    PoPMetricField,
    PreviousPeriodMetricField,
} from "../schemas/v1/metadata.js";
import { type Profile } from "../types.js";

export const TABLE_PATH_DELIMITER = "/";

export function assertUnreachable(x: never): never {
    throw new Error(`Didn't expect to get here. Invalid value is "${JSON.stringify(x, null, 2)}".`);
}

export type FilePath = string[] | string;

export function parsePath(path: FilePath): string[] {
    if (Array.isArray(path)) {
        return path;
    }
    if (path === "") {
        return [];
    }
    return path.split("/");
}

export function getTableRootId(profile: Profile | null, item: Pick<Dataset, "data_source"> | null) {
    return `${item?.data_source ?? profile?.data_source ?? "default"}`;
}

/**
 * Convert IDs into a human-readable strings to be used as titles
 * E.g. "someId" or "some-id" or "some_id" or "some.id" will become "Some Id".
 */
export function convertIdToTitle(id: string | null = "") {
    return (id || "")
        .replace(/([A-Z])/g, " $1") // camel case to separate words
        .replace(/([_.-])+/g, " ") // underscore, dash or dot to space
        .split(" ")
        .map((w) => w.charAt(0).toLocaleUpperCase() + w.slice(1))
        .join(" ");
}

/**
 * Convert title into an id
 */
export function convertTitleToId(title: string | null = "") {
    return (title || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\W/g, "_")
        .toLowerCase();
}

const UUID4_REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export function convertIdOrTitleToId(id: string, title?: string | null): string {
    if (id.match(UUID4_REGEX) && title) {
        return convertTitleToId(title);
    }
    return id;
}

export type FullFields =
    | AttributeField
    | MetricField
    | CalculatedMetricField
    | InlineMetricField
    | ArithmeticMetricField
    | PoPMetricField
    | PreviousPeriodMetricField;

export function getFullField(field: Field): FullFields {
    if (typeof field === "string") {
        return {
            using: field,
        };
    }
    return field as FullFields;
}

export function getFullBucket(bucket: Bucket): ComplexBucket {
    if (typeof bucket === "string") {
        return {
            field: bucket,
        };
    }
    return bucket as ComplexBucket;
}
