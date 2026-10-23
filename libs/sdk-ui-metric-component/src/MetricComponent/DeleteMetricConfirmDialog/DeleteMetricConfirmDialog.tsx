// (C) 2021-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { usePromiseHandlerIndicator } from "../../shared/hooks/usePromiseHandlerIndicator.js";
import { makeStyles } from "../../shared/theme/index.js";

const useStyles = makeStyles()(() => ({
    root: {
        ".modalityPlugin-mask": {
            zIndex: 5001,
        },
    },
}));

export interface IDeleteMetricConfirmDialogProps {
    onClose?: () => void;
    onDelete?: () => Promise<void>;
}

export function DeleteMetricConfirmDialog({
    onClose,
    onDelete = () => Promise.resolve(),
}: IDeleteMetricConfirmDialogProps) {
    const intl = useIntl();
    const { classes, cx } = useStyles();
    const [deleteInProgress, deleteHandler] = usePromiseHandlerIndicator(onDelete);

    return (
        <ConfirmDialog
            cancelButtonText={intl.formatMessage({ id: "metricComponent.deleteMetricConfirmDialog.cancel" })}
            onCancel={onClose}
            onClose={onClose}
            submitButtonText={intl.formatMessage({ id: "metricComponent.deleteMetricConfirmDialog.delete" })}
            isSubmitDisabled={deleteInProgress}
            showProgressIndicator={deleteInProgress}
            onSubmit={deleteHandler}
            headline={intl.formatMessage({ id: "metricComponent.deleteMetricConfirmDialog.headline" })}
            containerClassName={cx(classes.root, "s-delete_dialog")}
        >
            <FormattedMessage id="metricComponent.deleteMetricConfirmDialog.content.line1" />
            <br />
            <FormattedMessage id="metricComponent.deleteMetricConfirmDialog.content.line2" />
        </ConfirmDialog>
    );
}
