// (C) 2024-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";

import { type IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import { ConfirmDialog, Input, Typography } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import { saveVisualizationAction, savedVisualizationAction } from "../../../store/messages/messagesSlice.js";

export type SaveVisualizationDialogProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>;
    type: "save" | "explore";
    onClose: () => void;
};

export function SaveVisualizationDialog({
    type,
    message,
    part,
    visualization,
    onClose,
}: SaveVisualizationDialogProps) {
    const intl = useIntl();

    const [value, setValue] = useState<string>(visualization.insight.title);
    const { onSubmit } = useVisualisationSaving(type, message, part, visualization, onClose);

    return (
        <ConfirmDialog
            onClose={onClose}
            onCancel={onClose}
            onSubmit={() => onSubmit(value)}
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
    visualization: NonNullable<IChatConversationVisualisationContent["visualization"]>,
    onClose: () => void,
) {
    const dispatch = useDispatch();

    // Close the dialog automatically once the item is saved
    const isStarted = part.saving?.started;
    const isComplete = part.saving?.completed;
    useEffect(() => {
        if (isStarted && isComplete) {
            onClose();
            dispatch(
                savedVisualizationAction({
                    visualizationId: visualization.insight.identifier,
                    assistantMessageId: message.localId,
                }),
            );
        }
    }, [isStarted, isComplete, onClose, part, dispatch, visualization.insight.identifier, message.localId]);

    const onSubmit = useCallback(
        async (title: string) => {
            dispatch(
                saveVisualizationAction({
                    visualizationId: visualization.insight.identifier,
                    visualizationTitle: title || visualization.insight.title,
                    assistantMessageId: message.localId,
                    explore: type === "explore",
                }),
            );
        },
        [type, message.localId, dispatch, visualization.insight.identifier, visualization.insight.title],
    );

    return {
        onSubmit,
    };
}
