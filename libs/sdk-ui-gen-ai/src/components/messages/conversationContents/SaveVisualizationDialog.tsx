// (C) 2024-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { ConfirmDialog, Input, Typography } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import { saveVisualizationAction } from "../../../store/messages/messagesSlice.js";

export type SaveVisualizationDialogProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    visualization: IChatConversationVisualisationContent["visualization"];
    type: "save" | "explore";
    onClose: () => void;
};

export type SaveVisualizationDialogDispatchProps = {
    saveVisualizationAction: typeof saveVisualizationAction;
};

function SaveVisualizationDialogCore({
    type,
    message,
    part,
    visualization,
    onClose,
    saveVisualizationAction,
}: SaveVisualizationDialogProps & SaveVisualizationDialogDispatchProps) {
    const intl = useIntl();

    const [value, setValue] = useState<string>(visualization.insight.title);
    const { onSubmit } = useVisualisationSaving(
        type,
        message,
        part,
        visualization,
        saveVisualizationAction,
        onClose,
    );

    return (
        <ConfirmDialog
            onClose={onClose}
            onCancel={onClose}
            onSubmit={onSubmit}
            isPositive
            autofocusOnOpen={false}
            submitOnEnterKey
            headline={intl.formatMessage({ id: "gd.gen-ai.save-dialog.title" })}
            cancelButtonText={intl.formatMessage({ id: "gd.gen-ai.button.cancel" })}
            submitButtonText={
                type === "save"
                    ? intl.formatMessage({ id: "gd.gen-ai.button.save" })
                    : intl.formatMessage({ id: "gd.gen-ai.button.save_and_explore" })
            }
            showProgressIndicator={part.saving?.started}
            isSubmitDisabled={part.saving?.started}
            isCancelDisabled={part.saving?.started}
            className="gd-gen-ai-chat__visualization__save-dialog"
        >
            <Typography tagName="p">
                {type === "save"
                    ? intl.formatMessage({ id: "gd.gen-ai.save-dialog.description" })
                    : intl.formatMessage({ id: "gd.gen-ai.save-dialog.description.explore" })}
            </Typography>
            <Input
                autofocus
                label={intl.formatMessage({ id: "gd.gen-ai.save-dialog.label" })}
                labelPositionTop
                placeholder={visualization.insight.title}
                value={value}
                disabled={part.saving?.started}
                onChange={(newValue) => setValue(String(newValue))}
            />
        </ConfirmDialog>
    );
}

//hooks

function useVisualisationSaving(
    type: "save" | "explore",
    message: IChatConversationLocalItem,
    part: IChatConversationMultipartLocalPart,
    visualization: IChatConversationVisualisationContent["visualization"],
    saveVisualization: typeof saveVisualizationAction,
    onClose: () => void,
) {
    // Close the dialog automatically once the item is saved
    const isStarted = part.saving?.started;
    const isComplete = part.saving?.completed;
    useEffect(() => {
        if (isStarted && isComplete) {
            onClose();
        }
    }, [isStarted, isComplete, onClose]);

    const onSubmit = useCallback(
        async (title: string) => {
            saveVisualization({
                visualizationId: visualization.insight.identifier,
                visualizationTitle: title || visualization.insight.title,
                assistantMessageId: message.localId,
                explore: type === "explore",
            });
        },
        [
            type,
            message.localId,
            saveVisualization,
            visualization.insight.identifier,
            visualization.insight.title,
        ],
    );

    return {
        onSubmit,
    };
}

const mapDispatchToProps = {
    saveVisualizationAction,
};

export const SaveVisualizationDialog = connect(null, mapDispatchToProps)(SaveVisualizationDialogCore);
