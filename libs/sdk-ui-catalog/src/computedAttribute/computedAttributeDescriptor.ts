// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IComputedAttributeMetadataObjectDefinition } from "@gooddata/sdk-model";

import {
    type IAsCodeEditing,
    type IAsCodeMessages,
    defineAsCodeDescriptor,
    fixedIdentifierOf,
} from "../asCode/descriptor.js";
import type { ICatalogItemComputedAttribute } from "../catalogItem/types.js";
import { ObjectTypes } from "../objectType/constants.js";

import { computedAttributeCompletions } from "./computedAttributeCompletions.js";
import {
    computedAttributeYamlToDefinition,
    definitionToComputedAttributeYaml,
    reconcileComputedAttributeDefinition,
} from "./computedAttributeConverter.js";
import { createCopiedComputedAttribute } from "./computedAttributeCopy.js";
import {
    createComputedAttributeMutationAdapter,
    listComputedAttributeReferences,
    loadComputedAttribute,
} from "./computedAttributeMutationPort.js";
import { serializeComputedAttributeToYaml } from "./computedAttributeSerialization.js";
import { validateComputedAttributeYaml } from "./computedAttributeValidation.js";
import { COMPUTED_ATTRIBUTE_FEATURE_FLAG } from "./gate.js";

const COMPUTED_ATTRIBUTE_DOCS_URL =
    "https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/structures/#computed-attribute";

const messages = defineMessages({
    createTitle: { id: "analyticsCatalog.computedAttribute.dialog.create.title" },
    editTitle: { id: "analyticsCatalog.computedAttribute.dialog.edit.title" },
    duplicate: { id: "analyticsCatalog.computedAttribute.dialog.edit.duplicate" },
    createDefaultTitle: { id: "analyticsCatalog.computedAttribute.create.defaultTitle" },
    createSuccess: { id: "analyticsCatalog.computedAttribute.create.success" },
    updateSuccess: { id: "analyticsCatalog.computedAttribute.update.success" },
    sectionHeader: { id: "analyticsCatalog.computedAttribute.dialog.sectionHeader" },
    sectionHeaderTooltip: { id: "analyticsCatalog.computedAttribute.dialog.sectionHeader.tooltip" },
    help: { id: "analyticsCatalog.computedAttribute.dialog.help" },
    submitError: { id: "analyticsCatalog.computedAttribute.dialog.submit.error" },
    deleteTitle: { id: "analyticsCatalog.computedAttribute.dialog.delete.title" },
    deleteBody: { id: "analyticsCatalog.computedAttribute.dialog.delete.body" },
    deleteSubmit: { id: "analyticsCatalog.computedAttribute.dialog.delete.submit" },
    deleteSuccess: { id: "analyticsCatalog.computedAttribute.delete.success" },
    deleteError: { id: "analyticsCatalog.computedAttribute.delete.error" },
}) satisfies IAsCodeMessages;

const capabilityMessages = defineMessages({
    loadError: { id: "analyticsCatalog.computedAttribute.load.error" },
    deleteUsageWarning: { id: "analyticsCatalog.computedAttribute.dialog.delete.usageWarning" },
    deleteBlocked: { id: "analyticsCatalog.computedAttribute.dialog.delete.blocked" },
});

const errorMessages = defineMessages({
    empty: { id: "analyticsCatalog.computedAttribute.validation.empty" },
    syntax: { id: "analyticsCatalog.computedAttribute.validation.syntax" },
    invalidStructure: { id: "analyticsCatalog.computedAttribute.validation.invalidStructure" },
    idImmutable: { id: "analyticsCatalog.computedAttribute.dialog.edit.idImmutable" },
    missingMaql: { id: "analyticsCatalog.computedAttribute.validation.missingMaql" },
    invalidType: { id: "analyticsCatalog.computedAttribute.validation.invalidType" },
    invalidTags: { id: "analyticsCatalog.computedAttribute.validation.invalidTags" },
});

function useComputedAttributeEditing(): IAsCodeEditing<IComputedAttributeMetadataObjectDefinition> {
    const intl = useIntl();
    return useMemo<IAsCodeEditing<IComputedAttributeMetadataObjectDefinition>>(
        () => ({
            completionSource: computedAttributeCompletions,
            syntaxErrorMessage: intl.formatMessage(errorMessages.syntax),
            // The editor works in the YAML shape, a lossy projection of the computed attribute
            // definition — lossy in what a document carries, which `reconcile` restores, never in
            // whether one exists.
            serialize: (definition) => ({
                yaml: serializeComputedAttributeToYaml(definitionToComputedAttributeYaml(definition)),
                hasCodeForm: true,
            }),
            validate: (value, context) => {
                const result = validateComputedAttributeYaml(value, {
                    fixedIdentifier: fixedIdentifierOf(context),
                });
                return result.isValid
                    ? { isValid: true, definition: result.computedAttribute }
                    : { isValid: false, error: intl.formatMessage(errorMessages[result.errorCode]) };
            },
            reconcile: reconcileComputedAttributeDefinition,
        }),
        [intl],
    );
}

/**
 * @internal
 */
export const computedAttributeDescriptor = defineAsCodeDescriptor<
    IComputedAttributeMetadataObjectDefinition,
    ICatalogItemComputedAttribute
>({
    objectType: ObjectTypes.COMPUTED_ATTRIBUTE,
    docsUrl: COMPUTED_ATTRIBUTE_DOCS_URL,
    featureFlag: COMPUTED_ATTRIBUTE_FEATURE_FLAG,
    messages,
    useEditing: useComputedAttributeEditing,
    createMutationPort: createComputedAttributeMutationAdapter,
    // The template offers the fields and leaves the MAQL line empty: the expression is the whole
    // point of the object, so a placeholder one would only be text to delete.
    emptyDefinition: (defaultTitle) =>
        computedAttributeYamlToDefinition({
            type: "computed_attribute",
            title: defaultTitle,
            maql: "",
        }),
    // The catalog item carries no MAQL, so the full object is fetched for editing.
    seed: { load: loadComputedAttribute, loadError: capabilityMessages.loadError },
    // Refuses the deletion while a visualization, metric, or dashboard still references it,
    // and names those objects. The backend currently allows the delete (it would break the
    // dependents silently), so the catalog is the guard.
    referenceCounted: {
        load: listComputedAttributeReferences,
        usageWarning: capabilityMessages.deleteUsageWarning,
        listReferences: true,
        blockedBody: capabilityMessages.deleteBlocked,
    },
    // A copied computed attribute derives a human-readable id that can collide on create; identity lets the dialog retry without it.
    identity: {
        read: (definition) => definition.id,
        strip: ({ id: _id, ...definition }) => definition,
    },
    toCopy: createCopiedComputedAttribute,
});
