// (C) 2024-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { type IChatVisualisationDefinition } from "@gooddata/sdk-backend-spi";
import { ConfirmDialog, Input, Typography } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocalItem, type IChatConversationMultipartLocalPart } from "../../../model.js";
import { saveVisualizationAction } from "../../../store/messages/messagesSlice.js";

export type SaveVisualizationDialogProps = {
    message: IChatConversationLocalItem;
    part: IChatConversationMultipartLocalPart;
    visualization: IChatVisualisationDefinition;
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

    const [value, setValue] = useState<string>(visualization.title);
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
            showProgressIndicator={part.saving}
            isSubmitDisabled={part.saving}
            isCancelDisabled={part.saving}
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
                placeholder={visualization.title}
                value={value}
                disabled={part.saving}
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
    visualization: IChatVisualisationDefinition,
    saveVisualization: typeof saveVisualizationAction,
    onClose: () => void,
) {
    const [savingStarted, setSavingStarted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Close the dialog automatically once the item is saved
    useEffect(() => {
        if (savingStarted && !part.saving) {
            setSavingStarted(false);
            onClose();
        }
    }, [savingStarted, part.saving, onClose]);

    const onSubmit = useCallback(
        async (title: string) => {
            setSavingStarted(true);
            setIsSaving(true);

            saveVisualization({
                visualizationId: visualization.id,
                visualizationTitle: title || visualization.title,
                assistantMessageId: message.localId,
                explore: type === "explore",
            });
        },
        [message.localId, saveVisualization, type, visualization.id, visualization.title],
    );

    return {
        isSaving,
        onSubmit,
    };
}

const mapDispatchToProps = {
    saveVisualizationAction,
};

export const SaveVisualizationDialog = connect(null, mapDispatchToProps)(SaveVisualizationDialogCore);
