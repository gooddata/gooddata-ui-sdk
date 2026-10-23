// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { makeStyles } from "../../shared/theme/index.js";
import { type MetricIdConflicts } from "../ConflictContext/useConflictDetection.js";
import { SaveNameMode } from "../Content/EditMetricContent.data.js";

const useStyles = makeStyles()(() => ({
    root: {
        wordBreak: "break-word",
        ".modalityPlugin-mask": {
            zIndex: 5001,
        },
        ".gd-dialog": {
            maxWidth: "420px !important",
        },
    },
    warningArea: {
        display: "flex",
        marginTop: "20px",

        "&:first-child": {
            marginTop: 0,
        },
    },
    warningIconArea: {
        fontSize: "20px",
        color: "#F28601",
    },
    warningSpace: {
        margin: "0 20px",
        width: 1,
        background: "#DDE4EB",
    },
    warningTextArea: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "#464E56",
    },
    warningTextAreaTitle: {
        color: "#000000",
    },
    contentArea: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
}));

interface IIdChangeConfirmDialogProps {
    mode: SaveNameMode | undefined;
    metricId: string;
    newMetricId: string;
    metricIdChanged: boolean;
    conflicts: MetricIdConflicts;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export function IdChangeConfirmDialog({
    onClose,
    onCancel,
    onSubmit,
    metricId,
    newMetricId,
    metricIdChanged,
    conflicts,
    mode,
}: IIdChangeConfirmDialogProps) {
    const intl = useIntl();
    const { classes, cx } = useStyles();

    const conflictsOccurred = conflicts.conflictWith.length > 0;
    const bothWarnings = conflictsOccurred && metricIdChanged;

    return (
        <ConfirmDialog
            cancelButtonText={
                mode === SaveNameMode.saveAsNew
                    ? intl.formatMessage(
                          { id: "metricComponent.idChangeConfirmDialog.generated" },
                          {
                              id: conflicts.usableIds[0],
                          },
                      )
                    : intl.formatMessage({ id: "metricComponent.idChangeConfirmDialog.keep" })
            }
            onCancel={onCancel}
            onClose={onClose}
            submitButtonText={
                !bothWarnings && conflictsOccurred
                    ? intl.formatMessage({ id: "metricComponent.idChangeConfirmDialog.submitOverwrite" })
                    : intl.formatMessage({ id: "metricComponent.idChangeConfirmDialog.submitChange" })
            }
            isSubmitDisabled={false}
            showProgressIndicator={false}
            onSubmit={onSubmit}
            headline={
                !bothWarnings && conflictsOccurred
                    ? intl.formatMessage({ id: "metricComponent.idChangeConfirmDialog.headlineOverwrite" })
                    : intl.formatMessage({ id: "metricComponent.idChangeConfirmDialog.headline" })
            }
            containerClassName={cx(classes.root, "s-id_change_dialog")}
        >
            <>
                {metricIdChanged && (
                    <WarningArea
                        simple={!bothWarnings}
                        title={<FormattedMessage id="metricComponent.idChangeConfirmDialog.changeTitle" />}
                        content={
                            <FormattedMessage
                                id="metricComponent.idChangeConfirmDialog.change"
                                values={{
                                    metricId: metricId || newMetricId,
                                    b: (chunks) => <b>{chunks}</b>,
                                }}
                            />
                        }
                    />
                )}
                {conflictsOccurred && (
                    <WarningArea
                        simple={!bothWarnings}
                        title={<FormattedMessage id="metricComponent.idChangeConfirmDialog.conflictsTitle" />}
                        content={
                            <div className={cx(classes.contentArea)}>
                                <div>
                                    <FormattedMessage
                                        id="metricComponent.idChangeConfirmDialog.conflicts"
                                        values={{
                                            metricId: newMetricId || metricId,
                                            conflicts: conflicts.conflictWith.join(", "),
                                            b: (chunks) => <b>{chunks}</b>,
                                        }}
                                    />
                                </div>
                                {!metricIdChanged && (
                                    <div>
                                        <FormattedMessage id="metricComponent.idChangeConfirmDialog.conflicts.footer" />
                                    </div>
                                )}
                            </div>
                        }
                    />
                )}
            </>
        </ConfirmDialog>
    );
}

interface IWarningAreaProps {
    simple: boolean;
    title: ReactElement;
    content: ReactElement;
}

function WarningArea({ title, content, simple }: IWarningAreaProps) {
    const { classes } = useStyles();

    if (simple) {
        return content;
    }

    return (
        <div className={classes.warningArea}>
            <div className={classes.warningIconArea}>
                <div className="icon gd-icon-warning" />
            </div>
            <div className={classes.warningSpace}></div>
            <div className={classes.warningTextArea}>
                <div className={classes.warningTextAreaTitle}>{title}</div>
                <div>{content}</div>
            </div>
        </div>
    );
}
