// (C) 2026 GoodData Corporation

import { forwardRef, useCallback } from "react";

import { defineMessages, useIntl } from "react-intl";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import {
    type IUiInlineTextGeneratorResult,
    UiInlineTextGenerator,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { isGenerateDescriptionSupportedObjectType } from "../catalogItem/query.js";
import type { ICatalogItem } from "../catalogItem/types.js";

const messages = defineMessages({
    generateDescriptionButton: {
        id: "analyticsCatalog.catalogItem.description.generate",
        defaultMessage: "Generate description with AI",
    },
    generatingDescription: {
        id: "analyticsCatalog.catalogItem.description.generate.loading",
        defaultMessage: "Generating...",
    },
    undoGeneratedDescription: {
        id: "analyticsCatalog.catalogItem.description.generate.undo",
        defaultMessage: "Undo",
    },
    generateDescriptionFailed: {
        id: "analyticsCatalog.catalogItem.description.generate.failed",
        defaultMessage: "Failed to generate description. Try again later.",
    },
});

interface ICatalogDetailGenerateDescriptionProps {
    item: ICatalogItem;
    onApplyDescription: (description: string) => void;
}

export const CatalogDetailGenerateDescription = forwardRef<
    HTMLDivElement,
    ICatalogDetailGenerateDescriptionProps
>(({ item, onApplyDescription }, ref) => {
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const { addError } = useToastMessage();

    const generateItemDescription = useCallback(async (): Promise<IUiInlineTextGeneratorResult> => {
        if (!isGenerateDescriptionSupportedObjectType(item.type)) {
            throw new Error(`Unsupported object type for generated description: ${item.type}`);
        }

        const response = await backend
            .workspace(workspaceId)
            .genAI()
            .getAnalyticsCatalog()
            .generateDescription({
                objectId: item.identifier,
                objectType: item.type,
            });

        return {
            text: response.description ?? "",
        };
    }, [backend, item.identifier, item.type, workspaceId]);

    const handleGenerateError = useCallback(
        (_error: Error) => {
            addError(messages.generateDescriptionFailed);
        },
        [addError],
    );

    const descriptionLabel = intl.formatMessage({ id: "analyticsCatalog.catalogItem.description" });
    const descriptionPlaceholder = intl.formatMessage({
        id: "analyticsCatalog.catalogItem.description.add",
    });

    return (
        <UiInlineTextGenerator
            ref={ref}
            value={item.description}
            onSubmit={onApplyDescription}
            maxRows={9999}
            ariaLabel={descriptionLabel}
            placeholder={descriptionPlaceholder}
            isEditableLabelWidthBasedOnText
            onGenerate={generateItemDescription}
            onGenerateError={handleGenerateError}
            generateButtonLabel={intl.formatMessage(messages.generateDescriptionButton)}
            generatingLabel={intl.formatMessage(messages.generatingDescription)}
            undoButtonLabel={intl.formatMessage(messages.undoGeneratedDescription)}
            generateButtonDataTestId="analytics-catalog-generate-description-button"
            undoButtonDataTestId="analytics-catalog-undo-description-button"
        >
            {item.description || descriptionPlaceholder}
            <i className="gd-icon-pencil" />
        </UiInlineTextGenerator>
    );
});

CatalogDetailGenerateDescription.displayName = "CatalogDetailGenerateDescription";
