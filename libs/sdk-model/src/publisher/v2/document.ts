// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IAuditableDates, type IAuditableUsers } from "../../base/metadata.js";
import { type ObjRef, isObjRef } from "../../objRef/index.js";

import {
    type PublisherContentVersionV2,
    type PublisherDocumentContentV2,
    type PublisherPeriodV2,
} from "./content.js";
import { type IPublisherPageBodyV2 } from "./page.js";

/**
 * Fields shared by the definitions of all Publisher entities.
 *
 * @alpha
 */
export interface IPublisherEntityDefinitionBaseV2 {
    /**
     * Present when updating an existing entity.
     */
    ref?: ObjRef;
    title: string;
    description?: string;
    tags?: string[];
    version: PublisherContentVersionV2;
}

/**
 * Fields shared by all persisted Publisher entities.
 *
 * @alpha
 */
export interface IPublisherEntityMetadataV2 extends IAuditableDates, IAuditableUsers {
    ref: ObjRef;
    /**
     * When true, the object comes from a parent workspace and is not editable
     * in the current workspace.
     */
    isLocked?: boolean;
}

/**
 * Payload for creating or updating a document.
 *
 * @alpha
 */
export interface IPublisherDocumentDefinitionV2 extends IPublisherEntityDefinitionBaseV2 {
    type: "document";
    period: PublisherPeriodV2;
    /**
     * A document created from a template gets a deep copy of its content and keeps no reference to it.
     */
    content: PublisherDocumentContentV2;
}

/**
 * Document metadata object.
 *
 * @alpha
 */
export interface IPublisherDocumentV2 extends IPublisherDocumentDefinitionV2, IPublisherEntityMetadataV2 {
    ref: ObjRef;
}

/**
 * Payload for creating or updating a document template.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplateDefinitionV2 extends IPublisherEntityDefinitionBaseV2 {
    type: "documentTemplate";
    content: PublisherDocumentContentV2;
}

/**
 * Document template metadata object.
 *
 * @alpha
 */
export interface IPublisherDocumentTemplateV2
    extends IPublisherDocumentTemplateDefinitionV2, IPublisherEntityMetadataV2 {
    ref: ObjRef;
}

/**
 * Payload for creating or updating a page template.
 *
 * @alpha
 */
export interface IPublisherPageTemplateDefinitionV2 extends IPublisherEntityDefinitionBaseV2 {
    type: "pageTemplate";
    content: IPublisherPageBodyV2;
}

/**
 * Page template metadata object.
 *
 * @alpha
 */
export interface IPublisherPageTemplateV2
    extends IPublisherPageTemplateDefinitionV2, IPublisherEntityMetadataV2 {
    ref: ObjRef;
    /**
     * True for the default page templates the backend serves. Their ids start with `default.`.
     */
    isDefault?: boolean;
}

/**
 * @alpha
 */
export function isPublisherDocumentDefinitionV2(obj: unknown): obj is IPublisherDocumentDefinitionV2 {
    return isPublisherEntityDefinitionV2(obj, "document");
}

/**
 * @alpha
 */
export function isPublisherDocumentV2(obj: unknown): obj is IPublisherDocumentV2 {
    return isPublisherDocumentDefinitionV2(obj) && isObjRef(obj.ref);
}

/**
 * @alpha
 */
export function isPublisherDocumentTemplateDefinitionV2(
    obj: unknown,
): obj is IPublisherDocumentTemplateDefinitionV2 {
    return isPublisherEntityDefinitionV2(obj, "documentTemplate");
}

/**
 * @alpha
 */
export function isPublisherDocumentTemplateV2(obj: unknown): obj is IPublisherDocumentTemplateV2 {
    return isPublisherDocumentTemplateDefinitionV2(obj) && isObjRef(obj.ref);
}

/**
 * @alpha
 */
export function isPublisherPageTemplateDefinitionV2(obj: unknown): obj is IPublisherPageTemplateDefinitionV2 {
    return isPublisherEntityDefinitionV2(obj, "pageTemplate");
}

/**
 * @alpha
 */
export function isPublisherPageTemplateV2(obj: unknown): obj is IPublisherPageTemplateV2 {
    return isPublisherPageTemplateDefinitionV2(obj) && isObjRef(obj.ref);
}

type PublisherEntityTypeV2 =
    | IPublisherDocumentDefinitionV2["type"]
    | IPublisherDocumentTemplateDefinitionV2["type"]
    | IPublisherPageTemplateDefinitionV2["type"];

const contentVersion: PublisherContentVersionV2 = "2";

function isPublisherEntityDefinitionV2(obj: unknown, type: PublisherEntityTypeV2): boolean {
    if (isEmpty(obj)) {
        return false;
    }
    const entity = obj as { type?: unknown; version?: unknown };
    return entity.type === type && entity.version === contentVersion;
}
