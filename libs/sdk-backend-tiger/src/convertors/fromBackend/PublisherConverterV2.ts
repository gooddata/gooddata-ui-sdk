// (C) 2026 GoodData Corporation

import {
    type JsonApiPublisherDocumentOut,
    type JsonApiPublisherDocumentOutWithLinks,
    type JsonApiPublisherDocumentPageTemplateOut,
    type JsonApiPublisherDocumentPageTemplateOutWithLinks,
    type JsonApiPublisherDocumentTemplateOut,
    type JsonApiPublisherDocumentTemplateOutWithLinks,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherDocumentSummaryV2,
    PublisherContentNotSupportedError,
    type PublisherDocumentListItemV2,
} from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentTemplateV2,
    type IPublisherDocumentV2,
    type IPublisherPageTemplateV2,
    type IPublisherValidationIssueV2,
    type PublisherContentVersionV2,
    idRef,
    isReservedPublisherEntityIdV2,
    validateLoadedPublisherEntityV2,
} from "@gooddata/sdk-model";

import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

type PublisherEntityOutV2 =
    | JsonApiPublisherDocumentOut
    | JsonApiPublisherDocumentOutWithLinks
    | JsonApiPublisherDocumentTemplateOut
    | JsonApiPublisherDocumentTemplateOutWithLinks
    | JsonApiPublisherDocumentPageTemplateOut
    | JsonApiPublisherDocumentPageTemplateOutWithLinks;

function distinctPresentTags(tags: string[] | undefined): string[] | undefined {
    const present = [...new Set(tags)].filter((tag) => tag !== "");
    return present.length ? present : undefined;
}

function entityMetadata(entity: PublisherEntityOutV2, included: JsonApiUserIdentifierOutWithLinks[]) {
    const { description } = entity.attributes;
    const tags = distinctPresentTags(entity.attributes.tags);
    return {
        ref: idRef(entity.id, entity.type),
        title: entity.attributes.title,
        ...(description ? { description } : {}),
        ...(tags ? { tags } : {}),
        isLocked: isInheritedObject(entity),
        created: entity.attributes.createdAt ?? undefined,
        updated: entity.attributes.modifiedAt ?? undefined,
        createdBy: convertUserIdentifier(entity.relationships?.createdBy, included),
        updatedBy: convertUserIdentifier(entity.relationships?.modifiedBy, included),
    };
}

function notSupported(
    entity: PublisherEntityOutV2,
    issues: IPublisherValidationIssueV2[],
): PublisherContentNotSupportedError {
    return new PublisherContentNotSupportedError(
        `The stored ${entity.type} "${entity.id}" is not supported content.`,
        {
            ref: idRef(entity.id, entity.type),
            title: entity.attributes.title,
            version: entity.attributes.version,
            issues,
        },
    );
}

type PublisherEntityV2 = IPublisherDocumentV2 | IPublisherDocumentTemplateV2 | IPublisherPageTemplateV2;

type PublisherEntityTypeV2 = PublisherEntityV2["type"];

type PublisherEntityOfTypeV2<K extends PublisherEntityTypeV2> = Extract<PublisherEntityV2, { type: K }>;

type Validated<T> = { valid: true; value: T } | { valid: false; issues: IPublisherValidationIssueV2[] };

interface IEntityCandidateV2 {
    type: PublisherEntityTypeV2;
    version: string;
}

const supportedVersion: PublisherContentVersionV2 = "2";

function validate<C extends IEntityCandidateV2>(candidate: C): Validated<PublisherEntityOfTypeV2<C["type"]>> {
    if (candidate.version !== supportedVersion) {
        return {
            valid: false,
            issues: [
                {
                    path: "version",
                    message: `Expected ${JSON.stringify(supportedVersion)}, got ${JSON.stringify(candidate.version)}.`,
                },
            ],
        };
    }
    const issues = validateLoadedPublisherEntityV2(candidate);
    // Sound: the candidate's type picks the schema that the validator checks every key and value against.
    return issues.length === 0
        ? { valid: true, value: candidate as unknown as PublisherEntityOfTypeV2<C["type"]> }
        : { valid: false, issues };
}

function readValidated<C extends IEntityCandidateV2>(
    entity: PublisherEntityOutV2,
    candidate: C,
): PublisherEntityOfTypeV2<C["type"]> {
    const result = validate(candidate);
    if (!result.valid) {
        throw notSupported(entity, result.issues);
    }
    return result.value;
}

function documentCandidate(
    entity: JsonApiPublisherDocumentOut | JsonApiPublisherDocumentOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[],
) {
    return {
        type: "document" as const,
        ...entityMetadata(entity, included),
        version: entity.attributes.version,
        period: entity.attributes.period,
        content: entity.attributes.content,
    };
}

export function convertPublisherDocumentV2(
    entity: JsonApiPublisherDocumentOut | JsonApiPublisherDocumentOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IPublisherDocumentV2 {
    return readValidated(entity, documentCandidate(entity, included));
}

export function convertPublisherDocumentListItemV2(
    entity: JsonApiPublisherDocumentOut | JsonApiPublisherDocumentOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): PublisherDocumentListItemV2 {
    const result = validate(documentCandidate(entity, included));
    if (result.valid) {
        return { supported: true, document: result.value };
    }
    const summary: IPublisherDocumentSummaryV2 = {
        ...entityMetadata(entity, included),
        version: entity.attributes.version,
    };
    return { supported: false, summary, error: notSupported(entity, result.issues) };
}

export function convertPublisherDocumentTemplateV2(
    entity: JsonApiPublisherDocumentTemplateOut | JsonApiPublisherDocumentTemplateOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IPublisherDocumentTemplateV2 {
    return readValidated(entity, {
        type: "documentTemplate" as const,
        ...entityMetadata(entity, included),
        version: entity.attributes.version,
        content: entity.attributes.content,
    });
}

export function convertPublisherPageTemplateV2(
    entity: JsonApiPublisherDocumentPageTemplateOut | JsonApiPublisherDocumentPageTemplateOutWithLinks,
    included: JsonApiUserIdentifierOutWithLinks[] = [],
): IPublisherPageTemplateV2 {
    return readValidated(entity, {
        type: "pageTemplate" as const,
        ...entityMetadata(entity, included),
        version: entity.attributes.version,
        content: entity.attributes.content,
        ...(isReservedPublisherEntityIdV2(entity.id) ? { isDefault: true } : {}),
    });
}
