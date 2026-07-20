// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { type IAsCodeEditing, type IAsCodeMessages, defineAsCodeDescriptor } from "../asCode/descriptor.js";
import type { ICatalogItemParameter } from "../catalogItem/types.js";
import { ObjectTypes } from "../objectType/constants.js";

import { PARAMETER_FEATURE_FLAG, useEnabledParameterTypes } from "./gate.js";
import { createParameterCompletions } from "./parameterCompletions.js";
import { createCopiedParameter } from "./parameterCopy.js";
import { createParameterMutationAdapter } from "./parameterMutationPort.js";
import { serializeParameterToYaml } from "./parameterSerialization.js";
import { validateParameterYaml } from "./parameterValidation.js";

const PARAMETER_DOCS_URL = "https://www.gooddata.ai/docs/cloud/experimental-features/numeric-parameters/";

const messages = defineMessages({
    createTitle: { id: "analyticsCatalog.parameter.dialog.create.title" },
    editTitle: { id: "analyticsCatalog.parameter.dialog.edit.title" },
    duplicate: { id: "analyticsCatalog.parameter.dialog.edit.duplicate" },
    createDefaultTitle: { id: "analyticsCatalog.parameter.create.defaultTitle" },
    createSuccess: { id: "analyticsCatalog.parameter.create.success" },
    updateSuccess: { id: "analyticsCatalog.parameter.update.success" },
    sectionHeader: { id: "analyticsCatalog.parameter.dialog.sectionHeader" },
    sectionHeaderTooltip: { id: "analyticsCatalog.parameter.dialog.sectionHeader.tooltip" },
    help: { id: "analyticsCatalog.parameter.dialog.help" },
    submitError: { id: "analyticsCatalog.parameter.dialog.submit.error" },
    deleteTitle: { id: "analyticsCatalog.parameter.dialog.delete.title" },
    deleteBody: { id: "analyticsCatalog.parameter.dialog.delete.body" },
    deleteSubmit: { id: "analyticsCatalog.parameter.dialog.delete.submit" },
    deleteSuccess: { id: "analyticsCatalog.parameter.delete.success" },
    deleteError: { id: "analyticsCatalog.parameter.delete.error" },
}) satisfies IAsCodeMessages;

const errorMessages = defineMessages({
    empty: { id: "analyticsCatalog.parameter.validation.empty" },
    syntax: { id: "analyticsCatalog.parameter.validation.syntax" },
    invalidStructure: { id: "analyticsCatalog.parameter.validation.invalidStructure" },
    idImmutable: { id: "analyticsCatalog.parameter.dialog.edit.idImmutable" },
    unsupportedType: { id: "analyticsCatalog.parameter.validation.unsupportedType" },
    invalidDefaultValue: { id: "analyticsCatalog.parameter.validation.invalidDefaultValue" },
    invalidConstraints: { id: "analyticsCatalog.parameter.validation.invalidConstraints" },
    invalidConstraintRange: { id: "analyticsCatalog.parameter.validation.invalidConstraintRange" },
    invalidTags: { id: "analyticsCatalog.parameter.validation.invalidTags" },
});

function useParameterEditing(): IAsCodeEditing<IParameterMetadataObjectDefinition> {
    const intl = useIntl();
    const enabledTypes = useEnabledParameterTypes();
    const completionSource = useMemo(() => createParameterCompletions(enabledTypes), [enabledTypes]);
    return useMemo<IAsCodeEditing<IParameterMetadataObjectDefinition>>(
        () => ({
            completionSource,
            syntaxErrorMessage: intl.formatMessage(errorMessages.syntax),
            // Parameter YAML round-trips 1:1 to its definition, so serialization is a plain stringify.
            serialize: (definition) => serializeParameterToYaml(definition),
            validate: (value, options) => {
                const result = validateParameterYaml(value, { enabledTypes, ...options });
                return result.isValid
                    ? { isValid: true, definition: result.parameter }
                    : {
                          isValid: false,
                          error: intl.formatMessage(errorMessages[result.errorCode], {
                              type: result.type,
                              enabledTypes: intl.formatList(enabledTypes, { type: "conjunction" }),
                          }),
                      };
            },
        }),
        [completionSource, enabledTypes, intl],
    );
}

/**
 * @internal
 */
export const parameterDescriptor = defineAsCodeDescriptor<
    IParameterMetadataObjectDefinition,
    ICatalogItemParameter
>({
    objectType: ObjectTypes.PARAMETER,
    docsUrl: PARAMETER_DOCS_URL,
    featureFlag: PARAMETER_FEATURE_FLAG,
    messages,
    useEditing: useParameterEditing,
    createMutationPort: createParameterMutationAdapter,
    emptyDefinition: (defaultTitle) => ({
        type: "parameter",
        title: defaultTitle,
        description: "",
        definition: { type: "NUMBER", defaultValue: 0 },
    }),
    // No port.load: the catalog item maps field-for-field to a definition, so the editor seeds from it.
    editSeed: (item) => ({
        id: item.identifier,
        type: "parameter",
        title: item.title,
        description: item.description,
        tags: item.tags,
        definition: item.definition,
    }),
    // Source is already a definition, so toCopy only re-derives identity; no applyYamlEdits (YAML round-trips 1:1).
    toCopy: createCopiedParameter,
});
