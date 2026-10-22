// (C) 2026 GoodData Corporation

import {
    type DeclarativePublisherDocument,
    type DeclarativePublisherDocumentPageTemplate,
    type DeclarativePublisherDocumentTemplate,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherValidationIssueV2,
    idRef,
    isPublisherEntityIdV2,
    isReservedPublisherEntityIdV2,
    validatePublisherEntityV2,
} from "@gooddata/sdk-model";

import { type DeclarativePublisherEntityKindV2 } from "./declarativePublisherTypesV2.js";

const declarativeKeys: Record<DeclarativePublisherEntityKindV2, ReadonlySet<string>> = {
    document: keySet({
        id: true,
        title: true,
        description: true,
        tags: true,
        version: true,
        period: true,
        content: true,
    } satisfies Record<keyof DeclarativePublisherDocument, true>),
    documentTemplate: keySet({
        id: true,
        title: true,
        description: true,
        tags: true,
        version: true,
        content: true,
    } satisfies Record<keyof DeclarativePublisherDocumentTemplate, true>),
    pageTemplate: keySet({
        ...({
            id: true,
            title: true,
            description: true,
            tags: true,
            version: true,
            content: true,
        } satisfies Record<keyof DeclarativePublisherDocumentPageTemplate, true>),
        // Marks a default page template, stored under a reserved `default.` id.
        isDefault: true,
    }),
};

const kinds = Object.keys(declarativeKeys);

function isKind(value: unknown): value is DeclarativePublisherEntityKindV2 {
    return typeof value === "string" && Object.hasOwn(declarativeKeys, value);
}

function listOfKinds(format: (kind: string) => string): string {
    const named = kinds.map(format);
    return `${named.slice(0, -1).join(", ")} or ${named[named.length - 1]}`;
}

function unknownKindIssue(kind: unknown): IPublisherValidationIssueV2 {
    return {
        path: "type",
        message: `Unknown kind ${JSON.stringify(kind)}; expected ${listOfKinds((name) => name)}.`,
    };
}

function keySet(keys: Record<string, true>): ReadonlySet<string> {
    return new Set(Object.keys(keys));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function onId(issue: IPublisherValidationIssueV2): IPublisherValidationIssueV2 {
    return issue.path === "ref" || issue.path.startsWith("ref.")
        ? { ...issue, path: `id${issue.path.slice("ref".length)}` }
        : issue;
}

function unknownKeyIssues(
    entity: Record<string, unknown>,
    knownKeys: ReadonlySet<string>,
): IPublisherValidationIssueV2[] {
    return Object.keys(entity)
        .filter((key) => entity[key] !== undefined && !knownKeys.has(key))
        .map((key) => ({ path: key, message: `Unknown key "${key}".` }));
}

function idIssues(id: unknown): IPublisherValidationIssueV2[] {
    if (id === undefined) {
        return [{ path: "id", message: 'Missing required key "id".' }];
    }
    if (typeof id !== "string" || id === "") {
        return [{ path: "id", message: `Expected a non-empty string, got ${JSON.stringify(id)}.` }];
    }
    return isPublisherEntityIdV2(id)
        ? []
        : [
              {
                  path: "id",
                  message: `Expected an id of 1 to 255 letters, digits, dots, underscores or hyphens, not starting with a dot, got ${JSON.stringify(id)}.`,
              },
          ];
}

const missingKindIssue: IPublisherValidationIssueV2 = {
    path: "type",
    message: `The stored shape has no "type" key; pass the kind (${listOfKinds((name) => JSON.stringify(name))}) to the validator.`,
};

function isBackendDefaultPageTemplate(
    entity: Record<string, unknown>,
    kind: DeclarativePublisherEntityKindV2,
): boolean {
    const { id } = entity;
    return (
        kind === "pageTemplate" &&
        entity["isDefault"] === true &&
        typeof id === "string" &&
        isReservedPublisherEntityIdV2(id)
    );
}

// A backend default page template is stored under the `default.` id that the save validation refuses,
// so it is validated without its reference; idIssues still checks the id itself.
function asDefinition(
    entity: Record<string, unknown>,
    kind: DeclarativePublisherEntityKindV2,
): Record<string, unknown> {
    const { id, ...rest } = entity;
    const known = Object.fromEntries(Object.entries(rest).filter(([key]) => declarativeKeys[kind].has(key)));
    const typed = { ...known, type: kind };
    return isPublisherEntityIdV2(id) && !isBackendDefaultPageTemplate(entity, kind)
        ? { ...typed, ref: idRef(id) }
        : typed;
}

function issuesOfKind(
    entity: Record<string, unknown>,
    kind: DeclarativePublisherEntityKindV2,
    knownKeys: ReadonlySet<string>,
): IPublisherValidationIssueV2[] {
    return [
        ...unknownKeyIssues(entity, knownKeys),
        ...idIssues(entity["id"]),
        ...validatePublisherEntityV2(asDefinition(entity, kind)).map(onId),
    ];
}

/**
 * Without a kind, the kind is read from the entity's own `type` key, which is then the one key allowed
 * beyond the stored ones; without either, one issue asks for the kind. The wasm build exposes this
 * variant, so the Python `kind` argument stays optional.
 */
export function validateDeclarativePublisherEntityWithOptionalKindV2(
    entity: unknown,
    kind?: string,
): IPublisherValidationIssueV2[] {
    if (kind !== undefined) {
        if (!isKind(kind)) {
            return [unknownKindIssue(kind)];
        }
        return isRecord(entity)
            ? issuesOfKind(entity, kind, declarativeKeys[kind])
            : validatePublisherEntityV2(entity);
    }
    if (!isRecord(entity)) {
        return validatePublisherEntityV2(entity);
    }
    const ownType = entity["type"];
    if (ownType === undefined) {
        return [...idIssues(entity["id"]), missingKindIssue];
    }
    if (!isKind(ownType)) {
        return [...idIssues(entity["id"]), unknownKindIssue(ownType)];
    }
    return issuesOfKind(entity, ownType, new Set([...declarativeKeys[ownType], "type"]));
}

/**
 * Validates a stored v2 document, document template or page template, named by the bare `id` the
 * declarative API stores. It runs the sdk-model validator, and an issue on the reference is reported
 * on `id`.
 *
 * @remarks
 * The declarative API stores no `type`, so the kind is passed next to the entity. Every key the
 * declarative API does not store for that kind is reported. An id starting with `default.` is
 * reported, except on a page template flagged `isDefault`: that is one of the backend's defaults.
 *
 * @alpha
 */
export function validateDeclarativePublisherEntityV2(
    entity: unknown,
    kind: DeclarativePublisherEntityKindV2,
): IPublisherValidationIssueV2[] {
    return validateDeclarativePublisherEntityWithOptionalKindV2(entity, kind);
}
