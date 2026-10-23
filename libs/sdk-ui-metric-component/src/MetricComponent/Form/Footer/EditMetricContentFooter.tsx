// (C) 2021-2026 GoodData Corporation

import { memo } from "react";

import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { Button, IconQuestionMark, LoadingSpinner } from "@gooddata/sdk-ui-kit";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { FormMode } from "../../../shared/Form/data.js";
import { useFormHandlers } from "../../../shared/Form/useFormHandlers.js";
import { howToCreateMetricLink } from "../../../shared/links.js";
import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { useMetricFormStatus } from "../hooks/useMetricFormStatus.js";

import { events } from "./EditMetricContentFooter.events.js";
import { EditMetricSaveMessage } from "./EditMetricSaveMessage.js";

const useStyles = makeStyles<void>()((theme: DefaultTheme) => {
    return {
        root: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 20,
        },
        helpText: {
            marginLeft: 6,
        },

        help: {
            display: "flex",
            color: theme.globals.colors.defaultStateBlank,
            cursor: "pointer",
            alignItems: "center",
            textDecoration: "none",

            "svg path": {
                fill: theme.globals.colors.dropdownButton,
            },

            "&:hover": {
                ".${helpText}": {
                    textDecoration: "underline",
                    color: theme.globals.colors.dropdownButtonHover,
                },

                "svg path": {
                    fill: theme.globals.colors.dropdownButtonHover,
                },
            },
        },

        spinner: {
            display: "inline-block",
            position: "relative",
            top: 4,
            right: 16,
        },
    };
});

export interface IEditMetricContentFooterProps {
    onCancel: () => void;
    onDelete: () => void;
    isWhiteLabeled?: boolean;
}

function EditMetricContentFooterComponent({
    onDelete,
    onCancel,
    isWhiteLabeled = false,
}: IEditMetricContentFooterProps) {
    const { classes, cx } = useStyles();
    const intl = useIntl();

    const { mode, isLocked, isEditable, isWriteable, isSaving, isSaveAsDisabled, isSaveDisabled } =
        useMetricFormStatus();
    const { onSave, onSaveAs } = useFormHandlers();
    const { howToCreateClickEvent } = useEvents(events);

    return (
        <div className={classes.root}>
            <div className="links">
                {isWriteable && isEditable && !isWhiteLabeled && (
                    <a
                        className={cx(classes.help, "s-help_link")}
                        href={howToCreateMetricLink}
                        onClick={() => howToCreateClickEvent()}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <IconQuestionMark />
                        <div className={classes.helpText}>
                            <FormattedMessage id="metricComponent.editMetric.helpText" />
                        </div>
                    </a>
                )}
            </div>
            <div className="buttons">
                {isSaving && <LoadingSpinner className={cx(classes.spinner, "small")} />}
                {mode === FormMode.Edit && !isLocked && isEditable && (
                    <Button
                        type="button"
                        tagName="a"
                        value={intl.formatMessage({ id: "metricComponent.editMetric.delete" })}
                        onClick={onDelete}
                        className="gd-button-link-dimmed s-button-delete"
                    />
                )}
                <Button
                    value={
                        isEditable
                            ? intl.formatMessage({ id: "metricComponent.editMetric.cancel" })
                            : intl.formatMessage({ id: "metricComponent.editMetric.close" })
                    }
                    onClick={onCancel}
                    className="gd-button-secondary s-button-close"
                />
                {mode === FormMode.Edit && isWriteable && (
                    <EditMetricSaveMessage
                        onClick={onSaveAs}
                        text={intl.formatMessage({ id: "metricComponent.editMetric.saveAsNew" })}
                        className="gd-button"
                    >
                        <Button
                            value={intl.formatMessage({ id: "metricComponent.editMetric.saveAsNew" })}
                            onClick={onSaveAs}
                            className={classNames(
                                "gd-button-secondary",
                                "s-button-save-as",
                                isSaveAsDisabled && "disabled",
                            )}
                        />
                    </EditMetricSaveMessage>
                )}
                {!isLocked && isEditable && (
                    <EditMetricSaveMessage
                        onClick={onSave}
                        text={intl.formatMessage({ id: "metricComponent.editMetric.save" })}
                        className="gd-button"
                    >
                        <Button
                            value={intl.formatMessage({ id: "metricComponent.editMetric.save" })}
                            onClick={onSave}
                            className={classNames(
                                "gd-button-action",
                                "s-button-save",
                                isSaveDisabled && "disabled",
                            )}
                        />
                    </EditMetricSaveMessage>
                )}
            </div>
        </div>
    );
}

export const EditMetricContentFooter = memo(EditMetricContentFooterComponent);
