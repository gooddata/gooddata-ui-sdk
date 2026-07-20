// (C) 2026 GoodData Corporation

import type { CompletionSource } from "@codemirror/autocomplete";
import type { MessageDescriptor } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import type { ICatalogItem, ICatalogItemRef } from "../catalogItem/types.js";
import type { ObjectTypes } from "../objectType/constants.js";
import type { ObjectType } from "../objectType/types.js";
import type { useFeatureFlag } from "../permission/PermissionsContext.js";

/** A feature-flag name, as accepted by {@link useFeatureFlag}. */
export type AsCodeFeatureFlag = Parameters<typeof useFeatureFlag>[0];

/**
 * The catalog object types editable as code. Add a member and the registry won't compile until it
 * registers a descriptor for the new type, whose own type then forces every field.
 */
export type AsCodeObjectType = typeof ObjectTypes.METRIC | typeof ObjectTypes.PARAMETER;

/**
 * The one field the generic layer reads off any as-code definition: an optional identity. Everything
 * else about a definition stays opaque to that layer.
 */
export interface IAsCodeDefinition {
    id?: string;
}

/**
 * The entity-specific strings a generic as-code dialog needs. The generic chrome (Create/Save/Cancel/
 * Duplicate, the "Error:" label) is shared and lives in the dialog, not here — these are only the
 * strings that name or describe the entity.
 */
export interface IAsCodeMessages {
    createTitle: MessageDescriptor;
    editTitle: MessageDescriptor;
    /** Label of the duplicate action (edit-dialog button + detail menu); per-entity — a metric says
     *  "Duplicate", a parameter "Save as new". */
    duplicate: MessageDescriptor;
    /** Default title seeded into a blank create. */
    createDefaultTitle: MessageDescriptor;
    createSuccess: MessageDescriptor;
    updateSuccess: MessageDescriptor;
    /** Heading above the editor, e.g. "Metric definition". */
    sectionHeader: MessageDescriptor;
    /** Tooltip explaining what the YAML should contain. */
    sectionHeaderTooltip: MessageDescriptor;
    /** Text of the docs link, e.g. "How to write a metric". */
    help: MessageDescriptor;
    /** Fallback shown when a save fails without a backend detail. */
    submitError: MessageDescriptor;
    /**
     * Shown when fetching the object to edit fails. A type that defines `port.load` should provide it;
     * without it a load failure closes the dialog silently. A type that never loads omits it.
     */
    loadError?: MessageDescriptor;

    deleteTitle: MessageDescriptor;
    /** Confirmation body; receives the object's `name` and a `b` bold-chunk renderer. */
    deleteBody: MessageDescriptor;
    deleteSubmit: MessageDescriptor;
    deleteSuccess: MessageDescriptor;
    deleteError: MessageDescriptor;
    /**
     * Warns that other objects depend on this one; receives their `count`. Only types that report a
     * referencing count (see `port.getReferencingObjectsCount`) provide it.
     */
    deleteUsageWarning?: MessageDescriptor;
}

/**
 * Outcome of validating YAML: the parsed definition, or an already-localized error message. The entity
 * localizes the error itself, so there is no shared error-code vocabulary.
 */
export type AsCodeValidation<TDef> = { isValid: true; definition: TDef } | { isValid: false; error: string };

/**
 * The per-entity editing behavior. Everything here can depend on the entity's own runtime context
 * (e.g. a parameter's enabled types), which is why it is delivered through a hook rather than as static
 * fields: the entity gathers its context, the generic shell never has to know about it.
 */
export interface IAsCodeEditing<TDef extends IAsCodeDefinition> {
    /** Autocompletion source fed to the shared `<YamlEditor>`. */
    completionSource: CompletionSource;
    /** Localized message the editor's inline linter shows on a YAML syntax error. */
    syntaxErrorMessage: string;
    /** Renders a definition to the YAML seed shown in the editor. */
    serialize(definition: TDef): string;
    /**
     * Parses + validates YAML, returning the definition or a localized error. Identity is fixed while
     * editing via `fixedIdentifier`.
     */
    validate(value: string, options: { fixedIdentifier?: string }): AsCodeValidation<TDef>;
}

/**
 * Backend operations for one catalog as-code object type. Everything flows in the definition shape:
 * `load` returns the full editable definition (a metric's loaded measure already is one), and `update`
 * takes that as its `base`.
 *
 * `load` and `getReferencingObjectsCount` are optional capabilities. A type whose catalog item already
 * holds everything the editor needs omits `load` and supplies `editSeed` on the descriptor instead; a
 * type that tracks no referencing objects omits `getReferencingObjectsCount` (delete shows no warning).
 */
export interface IAsCodeMutationPort<
    TDef extends IAsCodeDefinition = IAsCodeDefinition,
    TItem extends ICatalogItem = ICatalogItem,
> {
    create(definition: TDef): Promise<TItem>;
    update(base: TDef, definition: TDef): Promise<TItem>;
    delete(ref: ICatalogItemRef): Promise<void>;
    load?(item: TItem): Promise<TDef>;
    /** How many objects reference this one — used to warn before deletion. */
    getReferencingObjectsCount?(item: TItem): Promise<number>;
}

/**
 * The contract one entity type implements so the shared as-code shell (dialogs, mutation ports, detail
 * actions) can drive it. Adding a type is "write one descriptor and register it"; the shell never
 * imports the concrete type.
 *
 * `useEditing` is a hook and differs in shape across types, so a component that calls it must bind to
 * ONE descriptor per mount and remount when the type changes (the detail dispatch keys on `objectType`
 * for this) — otherwise the hook order would shift and break the rules of hooks.
 */
export interface IAsCodeDescriptor<
    TDef extends IAsCodeDefinition = IAsCodeDefinition,
    TItem extends ICatalogItem = ICatalogItem,
> {
    objectType: ObjectType;
    docsUrl: string;
    /**
     * Gates whether this type's in-catalog editor is offered, paired with the per-item edit
     * permission. Omit it for a type that is always editable (no feature-flag gate).
     */
    featureFlag?: AsCodeFeatureFlag;
    messages: IAsCodeMessages;

    /** The entity's per-mount editing behavior; a hook so it can read its own context. */
    useEditing(): IAsCodeEditing<TDef>;
    /** Builds this type's backend adapter; the mutation provider calls it once per backend/workspace. */
    createMutationPort(backend: IAnalyticalBackend, workspace: string): IAsCodeMutationPort<TDef, TItem>;

    /** A blank definition for a fresh create, seeded with a default title. */
    emptyDefinition(defaultTitle: string): TDef;
    /**
     * Maps a catalog item to its editable definition without a fetch. Provided by types whose item
     * already holds everything the editor needs; a type that must fetch (see `port.load`) omits it.
     * A descriptor provides exactly one of `editSeed` / `port.load`.
     */
    editSeed?(item: TItem): TDef;
    /** Derives a duplicate's definition from a source definition (bumps title, re-derives identity). */
    toCopy(source: TDef): TDef;
    /**
     * Overlays the author's parsed YAML edits onto the full definition, re-adding fields the YAML
     * cannot express (metric: metricType/isHiddenFromKda). Used both to seed a duplicate from the open
     * editor and to reconcile a duplicate on save. Omitted — meaning `(_, parsed) => parsed` — for
     * types whose YAML round-trips 1:1 to the definition (parameter).
     */
    applyYamlEdits?(full: TDef, parsed: TDef): TDef;
    /**
     * Label of the action that opens the object in its standalone editor; declaring it signals the type
     * has such an editor. Omit it for a type with none (a parameter).
     */
    openAction?: MessageDescriptor;
}

/**
 * Identity helper that keeps a descriptor's generics inferred at authoring while letting the registry
 * store it widened, so the generic components never have to narrow.
 */
export function defineAsCodeDescriptor<TDef extends IAsCodeDefinition, TItem extends ICatalogItem>(
    descriptor: IAsCodeDescriptor<TDef, TItem>,
): IAsCodeDescriptor<TDef, TItem> {
    return descriptor;
}
