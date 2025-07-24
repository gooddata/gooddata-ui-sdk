// (C) 2024-2025 GoodData Corporation
import * as React from "react";
import { useDispatch } from "react-redux";
import { ConfirmDialog, Input, Typography } from "@gooddata/sdk-ui-kit";
import { IGenAIVisualization } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

import { saveVisualizationAction } from "../../../store/index.js";

import { useVisualisationSaving } from "./hooks/useVisualisationSaving.js";

export type VisualizationSaveDialogProps = {
    onClose: () => void;
    visualization: IGenAIVisualization;
    messageId: string;
    type: "save" | "explore";
};

export function VisualizationSaveDialog({
    onClose,
    visualization,
    messageId,
    type,
}: VisualizationSaveDialogProps) {
    const intl = useIntl();
    const dispatch = useDispatch();

    const [value, setValue] = React.useState<string>(visualization.title);
    const { setSavingStarted } = useVisualisationSaving(visualization, onClose);

    return (
        <ConfirmDialog
            onClose={onClose}
            onCancel={onClose}
            onSubmit={() => {
                setSavingStarted(true);
                dispatch(
                    saveVisualizationAction({
                        visualizationId: visualization.id,
                        visualizationTitle: value || visualization.title,
                        assistantMessageId: messageId,
                        explore: type === "explore",
                    }),
                );
            }}
            isPositive
            autofocusOnOpen={false}
            submitOnEnterKey={true}
            headline={intl.formatMessage({ id: "gd.gen-ai.save-dialog.title" })}
            cancelButtonText={intl.formatMessage({ id: "gd.gen-ai.button.cancel" })}
            submitButtonText={
                type === "save"
                    ? intl.formatMessage({ id: "gd.gen-ai.button.save" })
                    : intl.formatMessage({ id: "gd.gen-ai.button.save_and_explore" })
            }
            showProgressIndicator={visualization.saving}
            isSubmitDisabled={visualization.saving}
            isCancelDisabled={visualization.saving}
            className="gd-gen-ai-chat__visualization__save-dialog"
        >
            <Typography tagName="p">
                {type === "save"
                    ? intl.formatMessage({ id: "gd.gen-ai.save-dialog.description" })
                    : intl.formatMessage({ id: "gd.gen-ai.save-dialog.description.explore" })}
            </Typography>
            <Input
                autofocus={true}
                label={intl.formatMessage({ id: "gd.gen-ai.save-dialog.label" })}
                labelPositionTop
                placeholder={visualization.title}
                value={value}
                disabled={visualization.saving}
                onChange={(newValue) => setValue(String(newValue))}
            />
        </ConfirmDialog>
    );
}
