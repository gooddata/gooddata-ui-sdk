// (C) 2026 GoodData Corporation

import type { MessageDescriptor } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { YamlCompletionSource } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";
import type { ObjectTypes } from "../objectType/constants.js";
import type { ObjectType } from "../objectType/types.js";
import type { useFeatureFlag } from "../permission/PermissionsContext.js";

export type AsCodeFeatureFlag = Parameters<typeof useFeatureFlag>[0];

export type AsCodeObjectType =
    | typeof ObjectTypes.METRIC
    | typeof ObjectTypes.PARAMETER
    | typeof ObjectTypes.COMPUTED_ATTRIBUTE
    | typeof ObjectTypes.VISUALIZATION;

export interface IAsCodeMessages {
    createTitle: MessageDescriptor;
    editTitle: MessageDescriptor;
    duplicate: MessageDescriptor;
    createDefaultTitle: MessageDescriptor;
    createSuccess: MessageDescriptor;
    updateSuccess: MessageDescriptor;
    sectionHeader: MessageDescriptor;
    sectionHeaderTooltip: MessageDescriptor;
    help: MessageDescriptor;
    submitError: MessageDescriptor;

    deleteTitle: MessageDescriptor;
    deleteBody: MessageDescriptor;
    deleteSubmit: MessageDescriptor;
    deleteSuccess: MessageDescriptor;
    deleteError: MessageDescriptor;
}

/** @internal */
export type AsCodeValidation<TDef> = { isValid: true; definition: TDef } | { isValid: false; error: string };

/**
 * Identity rule per flow: `edit` keeps `fixedIdentifier`; `duplicate` accepts and ignores any id (the
 * copy re-derives identity downstream); `create` applies the entity's own id policy.
 * @internal
 */
export type AsCodeValidationContext =
    | { intent: "create" }
    | { intent: "edit"; fixedIdentifier: string }
    | { intent: "duplicate" };

/** @internal */
export function fixedIdentifierOf(context: AsCodeValidationContext): string | undefined {
    return context.intent === "edit" ? context.fixedIdentifier : undefined;
}

/** @internal */
export type AsCodeSerialization = {
    yaml: string;
    /**
     * False for a definition with no code form at all, so no edit of it can be saved — as opposed to a
     * document the codec's own rules reject, which the author can act on.
     */
    hasCodeForm: boolean;
};

/** @internal */
export interface IAsCodeEditing<TDef> {
    completionSource: YamlCompletionSource;
    syntaxErrorMessage: string;
    /** A throw is a failure to load the object, not a document error: the dialog closes. */
    serialize(definition: TDef): AsCodeSerialization;
    validate(value: string, context: AsCodeValidationContext): AsCodeValidation<TDef>;
    /** Re-adds content the YAML can't express; applied on every persisting path. Omit if lossless. */
    reconcile?(base: TDef, edited: TDef): TDef;
}

/**
 * `update`'s `definition` (already reconciled) is authoritative for content; `base` supplies only the
 * server-managed identity the definition shape cannot carry.
 */
export interface IAsCodeMutationPort<TDef = unknown, TItem extends ICatalogItem = ICatalogItem> {
    create(definition: TDef): Promise<TItem>;
    update(base: TDef, definition: TDef): Promise<TItem>;
    delete(ref: ICatalogItemRef): Promise<void>;
}

/**
 * The `never` fields keep the variants exclusive: excess-property checking runs per union constituent,
 * so without them a literal mixing both (e.g. `load` with no `loadError`) would typecheck.
 * @internal
 */
export type AsCodeSeed<TDef, TItem extends ICatalogItem> =
    | { editSeed(item: TItem): TDef; load?: never; loadError?: never }
    | {
          editSeed?: never;
          load(backend: IAnalyticalBackend, workspace: string, item: TItem): Promise<TDef>;
          loadError: MessageDescriptor;
      };

/** @internal */
export function isLoadSeed<TDef, TItem extends ICatalogItem>(
    seed: AsCodeSeed<TDef, TItem>,
): seed is Extract<AsCodeSeed<TDef, TItem>, { loadError: MessageDescriptor }> {
    return seed.load !== undefined;
}

/** @internal */
export function loadErrorOf(descriptor: IAsCodeDescriptor): MessageDescriptor | undefined {
    return isLoadSeed(descriptor.seed) ? descriptor.seed.loadError : undefined;
}

/** @internal */
export type AsCodeReferenceCount<TItem extends ICatalogItem> = {
    /** Titles of the objects referencing the item; the count in the warning is their number. */
    load(backend: IAnalyticalBackend, workspace: string, item: TItem): Promise<string[]>;
    usageWarning: MessageDescriptor;
    /** Discloses the referencing titles behind a Show more/Show less toggle. */
    listReferences?: boolean;
    /**
     * Refuses the deletion while any reference exists — for a type the backend rejects rather than
     * cascades — and replaces the delete body with this text.
     */
    blockedBody?: MessageDescriptor;
};

/**
 * Duplicate-collision retry: the create dialog retries without the id when a copy's derived id
 * collides. Omitted by a type whose creates never carry an id.
 * @internal
 */
export type AsCodeIdentity<TDef> = {
    read(definition: TDef): string | undefined;
    strip(definition: TDef): TDef;
};

/**
 * A component calling `useEditing` (or the other hooks here) must bind to ONE descriptor per mount and
 * remount when the type changes (the detail dispatch keys on `objectType`), or the hook order shifts
 * and breaks the rules of hooks.
 */
export interface IAsCodeDescriptor<TDef = unknown, TItem extends ICatalogItem = ICatalogItem> {
    objectType: ObjectType;
    docsUrl: string;
    featureFlag?: AsCodeFeatureFlag;
    messages: IAsCodeMessages;

    /** `null` while an async editing brain is still loading. */
    useEditing(): IAsCodeEditing<TDef> | null;
    /**
     * Starts/retries building the async editing brain; the promise rejects when it can't be built. The
     * returned function must keep a stable identity while the request target is unchanged — it is an
     * effect dependency, so a new identity re-issues the request.
     */
    useRequestEditing?(): () => Promise<void>;
    useIsItemEditable?(item: TItem): boolean;
    /** Extra requirement for creation, ANDed with the feature flag and manage permission. */
    useCreateGate?(): boolean;
    createMutationPort(backend: IAnalyticalBackend, workspace: string): IAsCodeMutationPort<TDef, TItem>;

    emptyDefinition(defaultTitle: string): TDef;
    seed: AsCodeSeed<TDef, TItem>;
    referenceCounted?: AsCodeReferenceCount<TItem>;
    identity?: AsCodeIdentity<TDef>;
    toCopy(source: TDef): TDef;
    /** Presence signals the type has a standalone editor; its label opens it. */
    openAction?: MessageDescriptor;
}

/** Infers a descriptor's generics at authoring while the registry stores it widened. */
export function defineAsCodeDescriptor<TDef, TItem extends ICatalogItem>(
    descriptor: IAsCodeDescriptor<TDef, TItem>,
): IAsCodeDescriptor<TDef, TItem> {
    return descriptor;
}
