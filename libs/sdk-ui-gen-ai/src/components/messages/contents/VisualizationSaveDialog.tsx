// (C) 2024-2025 GoodData Corporation
import * as React from "react";
import { ConfirmDialog, Input, Typography } from "@gooddata/sdk-ui-kit";
import { IGenAIVisualization } from "@gooddata/sdk-model";
import { connect } from "react-redux";
import { saveVisualizationAction } from "../../../store/index.js";
import { injectIntl, WrappedComponentProps } from "react-intl";

export type VisualizationSaveDialogProps = {
    onClose: () => void;
    visualization: IGenAIVisualization;
    messageId: string;
};

export type VisualizationSaveDialogDispatchProps = {
    saveVisualizationAction: typeof saveVisualizationAction;
};

const VisualizationSaveDialogCore: React.FC<
    VisualizationSaveDialogProps & VisualizationSaveDialogDispatchProps & WrappedComponentProps
> = ({ onClose, visualization, messageId, saveVisualizationAction, intl }) => {
    const [value, setValue] = React.useState<string>(visualization.title);
    const [savingStarted, setSavingStarted] = React.useState<boolean>(false);

    // Close the dialog automatically once the item is saved
    // TODO - error handling
    const isSaving = visualization.saving;
    React.useEffect(() => {
        if (savingStarted && !isSaving) {
            onClose();
        }
    }, [savingStarted, isSaving, onClose]);

    return (
        <ConfirmDialog
            onClose={onClose}
            onCancel={onClose}
            onSubmit={() => {
                setSavingStarted(true);
                saveVisualizationAction({
                    visualizationId: visualization.id,
                    visualizationTitle: value || visualization.title,
                    assistantMessageId: messageId,
                });
            }}
            isPositive
            headline={intl.formatMessage({ id: "gd.gen-ai.save-dialog.title" })}
            cancelButtonText={intl.formatMessage({ id: "gd.gen-ai.button.cancel" })}
            submitButtonText={intl.formatMessage({ id: "gd.gen-ai.button.save" })}
            showProgressIndicator={visualization.saving}
            isSubmitDisabled={visualization.saving}
            isCancelDisabled={visualization.saving}
            className="gd-gen-ai-chat__visualization__save-dialog"
        >
            <Typography tagName="p">
                {intl.formatMessage({ id: "gd.gen-ai.save-dialog.description" })}
            </Typography>
            <Input
                label={intl.formatMessage({ id: "gd.gen-ai.save-dialog.label" })}
                labelPositionTop
                placeholder={visualization.title}
                value={value}
                disabled={visualization.saving}
                onChange={(newValue) => setValue(String(newValue))}
            />
        </ConfirmDialog>
    );
};

const mapDispatchToProps = {
    saveVisualizationAction,
};

export const VisualizationSaveDialog = connect(
    null,
    mapDispatchToProps,
)(injectIntl(VisualizationSaveDialogCore));
