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
    generateTitleButton: {
        id: "analyticsCatalog.catalogItem.title.generate",
        defaultMessage: "Generate title with AI",
    },
    generatingTitle: {
        id: "analyticsCatalog.catalogItem.title.generate.loading",
        defaultMessage: "Generating...",
    },
    undoGeneratedTitle: {
        id: "analyticsCatalog.catalogItem.title.generate.undo",
        defaultMessage: "Undo",
    },
    generateTitleFailed: {
        id: "analyticsCatalog.catalogItem.title.generate.failed",
        defaultMessage: "Failed to generate title. Try again later.",
    },
});

interface ICatalogDetailGenerateTitleProps {
    item: ICatalogItem;
    onApplyTitle: (title: string) => void;
}

export const CatalogDetailGenerateTitle = forwardRef<HTMLDivElement, ICatalogDetailGenerateTitleProps>(
    ({ item, onApplyTitle }, ref) => {
        const intl = useIntl();
        const backend = useBackendStrict();
        const workspaceId = useWorkspaceStrict();
        const { addError } = useToastMessage();

        const generateItemTitle = useCallback(async (): Promise<IUiInlineTextGeneratorResult> => {
            if (!isGenerateDescriptionSupportedObjectType(item.type)) {
                throw new Error(`Unsupported object type for generated title: ${item.type}`);
            }

            const response = await backend
                .workspace(workspaceId)
                .genAI()
                .getAnalyticsCatalog()
                .generateTitle({
                    objectId: item.identifier,
                    objectType: item.type,
                });

            return {
                text: response.title ?? "",
            };
        }, [backend, item.identifier, item.type, workspaceId]);

        const handleGenerateError = useCallback(
            (_error: Error) => {
                addError(messages.generateTitleFailed);
            },
            [addError],
        );

        const titleLabel = intl.formatMessage({ id: "analyticsCatalog.column.title.label" });
        const titlePlaceholder = intl.formatMessage({
            id: "analyticsCatalog.catalogItem.title.add",
        });

        return (
            <UiInlineTextGenerator
                ref={ref}
                value={item.title}
                onSubmit={onApplyTitle}
                maxRows={9999}
                ariaLabel={titleLabel}
                placeholder={titlePlaceholder}
                isEditableLabelWidthBasedOnText
                onGenerate={generateItemTitle}
                onGenerateError={handleGenerateError}
                generateButtonLabel={intl.formatMessage(messages.generateTitleButton)}
                generatingLabel={intl.formatMessage(messages.generatingTitle)}
                undoButtonLabel={intl.formatMessage(messages.undoGeneratedTitle)}
                generateButtonDataTestId="analytics-catalog-generate-title-button"
                undoButtonDataTestId="analytics-catalog-undo-title-button"
            >
                {item.title || titlePlaceholder}
                <i className="gd-icon-pencil" />
            </UiInlineTextGenerator>
        );
    },
);

CatalogDetailGenerateTitle.displayName = "CatalogDetailGenerateTitle";
