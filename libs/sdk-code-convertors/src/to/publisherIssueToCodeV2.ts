// (C) 2026 GoodData Corporation

import { type IPublisherValidationIssueV2 } from "@gooddata/sdk-model";

import { snakeKey } from "../utils/keyCase.js";

type PathSegment = string | number;

function pathSegments(path: string): PathSegment[] {
    return Array.from(path.matchAll(/([^.[\]]+)|\[(\d+)\]/g), ([, key, index]) =>
        index === undefined ? (key ?? "") : Number(index),
    );
}

function joinPathSegments(segments: PathSegment[]): string {
    return segments.reduce<string>((path, segment) => {
        if (typeof segment === "number") {
            return `${path}[${segment}]`;
        }
        return path === "" ? segment : `${path}.${segment}`;
    }, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function child(value: unknown, segment: PathSegment): unknown {
    if (typeof segment === "number") {
        return Array.isArray(value) ? value[segment] : undefined;
    }
    return isRecord(value) ? value[segment] : undefined;
}

/** A stored filter is `{ <filter kind>: { localIdentifier } }`; an attribute filter config holds it directly. */
function localIdentifierOf(item: unknown): string | undefined {
    if (!isRecord(item)) {
        return undefined;
    }
    const inner = typeof item["localIdentifier"] === "string" ? item : Object.values(item)[0];
    return isRecord(inner) && typeof inner["localIdentifier"] === "string"
        ? inner["localIdentifier"]
        : undefined;
}

const filterLists = new Set(["filters", "attributeFilterConfigs"]);

interface ICodePath {
    path: PathSegment[];
    renamedKey?: { stored: string; code: string };
}

interface ISegmentContext {
    code: PathSegment[];
    stored: unknown;
    next: PathSegment | undefined;
}

/** The whole code path, when the segment is one the code writes as a single key. */
function endingPath(segment: string, { code, stored, next }: ISegmentContext): PathSegment[] | undefined {
    if (segment === "visualization") {
        return [...code, "visualization"];
    }
    if (segment === "dateDataSet") {
        return [...code, "date"];
    }
    if (filterLists.has(segment)) {
        const filter =
            typeof next === "number" ? localIdentifierOf(child(child(stored, segment), next)) : undefined;
        return filter === undefined ? [...code, "filters"] : [...code, "filters", filter];
    }
    return undefined;
}

function codePath(segments: PathSegment[], entity: unknown): ICodePath {
    const code: PathSegment[] = [];
    let stored = entity;
    for (const [index, segment] of segments.entries()) {
        if (typeof segment === "number") {
            code.push(segment);
        } else {
            if (index === 0 && segment === "ref") {
                return { path: ["id"] };
            }
            const ending = endingPath(segment, { code, stored, next: segments[index + 1] });
            if (ending !== undefined) {
                return { path: ending };
            }
            const codeKey = snakeKey(segment);
            code.push(codeKey);
            if (index === segments.length - 1 && codeKey !== segment) {
                return { path: code, renamedKey: { stored: segment, code: codeKey } };
            }
        }
        stored = child(stored, segment);
    }
    return { path: code };
}

/**
 * Names the place in the code that a v2 Publisher validation issue is about. The validator reports on
 * the converted entity, whose keys the code-to-entity converters rename; pass the entity it checked.
 *
 * @remarks
 * Filters are a list in the entity and a map keyed by filter id in the code, and the code has no
 * attribute filter configs of its own, so an issue inside either is reported on the filter's key under
 * `filters`. A message quoting a renamed key, such as an unknown key, quotes it as the code writes it.
 *
 * @alpha
 */
export function publisherIssueToCodeV2(
    issue: IPublisherValidationIssueV2,
    entity: unknown,
): IPublisherValidationIssueV2 {
    const { path, renamedKey } = codePath(pathSegments(issue.path), entity);
    return {
        path: joinPathSegments(path),
        message:
            renamedKey === undefined
                ? issue.message
                : issue.message.replaceAll(`"${renamedKey.stored}"`, `"${renamedKey.code}"`),
    };
}
