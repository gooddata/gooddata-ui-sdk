// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessages, useIntl } from "react-intl";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiGenerateTextDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import { isGenerateDescriptionSupportedObjectType } from "../catalogItem/query.js";
import type { ICatalogItem } from "../catalogItem/types.js";

const messages = defineMessages({
    generateDescriptionButton: {
        id: "analyticsCatalog.catalogItem.description.generate",
        defaultMessage: "Generate description",
    },
    generateDescriptionDialogTitle: {
        id: "analyticsCatalog.catalogItem.description.generate.dialog.title",
        defaultMessage: "Generate description",
    },
    generateDescriptionDialogDisclaimer: {
        id: "analyticsCatalog.catalogItem.description.generate.dialog.content",
        defaultMessage:
            "This description is AI-generated. Use the generated text as a starting point and review it before applying.",
    },
    generateDescriptionDialogAccept: {
        id: "analyticsCatalog.catalogItem.description.generate.dialog.accept",
        defaultMessage: "Accept",
    },
    generateDescriptionDialogDecline: {
        id: "analyticsCatalog.catalogItem.description.generate.dialog.decline",
        defaultMessage: "Decline",
    },
    generateDescriptionDialogNote: {
        id: "analyticsCatalog.catalogItem.description.generate.dialog.note",
        defaultMessage: "Note",
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

export function CatalogDetailGenerateDescription({
    item,
    onApplyDescription,
}: ICatalogDetailGenerateDescriptionProps) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const { addError } = useToastMessage();

    const generateItemDescription = useCallback(async () => {
        if (!isGenerateDescriptionSupportedObjectType(item.type)) {
            addError(messages.generateDescriptionFailed);
            throw new Error(`Unsupported object type for generated description: ${item.type}`);
        }

        try {
            const response = await backend
                .workspace(workspaceId)
                .genAI()
                .getAnalyticsCatalog()
                .generateDescription({
                    objectId: item.identifier,
                    objectType: item.type,
                });

            return {
                text: response.description,
                note: response.note,
            };
        } catch (error) {
            addError(messages.generateDescriptionFailed);
            throw error;
        }
    }, [addError, backend, item.identifier, item.type, workspaceId]);

    return (
        <UiGenerateTextDialog
            buttonDataTestId="analytics-catalog-generate-description-button"
            buttonLabel={intl.formatMessage(messages.generateDescriptionButton)}
            dialogTitle={intl.formatMessage(messages.generateDescriptionDialogTitle)}
            dialogDisclaimer={intl.formatMessage(messages.generateDescriptionDialogDisclaimer)}
            acceptLabel={intl.formatMessage(messages.generateDescriptionDialogAccept)}
            declineLabel={intl.formatMessage(messages.generateDescriptionDialogDecline)}
            noteLabel={intl.formatMessage(messages.generateDescriptionDialogNote)}
            textAreaAriaLabel={intl.formatMessage({ id: "analyticsCatalog.catalogItem.description" })}
            initialText={item.description}
            onGenerate={generateItemDescription}
            onAccept={onApplyDescription}
        />
    );
}
