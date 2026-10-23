// (C) 2021-2026 GoodData Corporation

import { type ReactElement, memo, useCallback } from "react";

import { useIntl } from "react-intl";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { InlineEditableValue } from "../EditableRow/InlineEditableValue.js";
import { events } from "../EditMetricContentForm.events.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";
import { useTitleExistsCheck } from "../hooks/useTitleExistsCheck.js";

const useStyles = makeStyles()(() => ({
    root: {
        display: "flex",
        flexShrink: 1,
        minWidth: 0,
    },
}));

export interface IMetricTitleFieldProps {
    className?: string;
}

function MetricTitleFieldComponent({ className }: IMetricTitleFieldProps): ReactElement | null {
    const { classes, cx } = useStyles();
    const intl = useIntl();

    const titleExists = useTitleExistsCheck();
    const { value, element, error, valid, isReadOnly, isLocked, onBlur, onChange } = useMetricFormField(
        FormField.title,
    );
    const onBlurHandler = useBlurEventsCallback(onBlur);

    return (
        <div className={cx(classes.root, className, "s-edit_dialog_title")}>
            <InlineEditableValue
                placeholder={intl.formatMessage({
                    id: "metricComponent.editMetricForm.namePlaceholder",
                })}
                ariaLabel={intl.formatMessage({ id: "metricComponent.editMetric.name.ariaLabel" })}
                readOnly={isLocked || isReadOnly}
                showWarning={titleExists}
                warningMessage={intl.formatMessage({
                    id: "metricComponent.editMetricForm.titleExists",
                })}
                onEditEndsValueTransformer={(s) => s.trim()}
                errorMessage={error?.message}
                showError={!valid}
                value={value}
                onBlur={onBlurHandler}
                onChange={onChange}
                ref={element}
            />
        </div>
    );
}

export const MetricTitleField = memo(MetricTitleFieldComponent);

function useBlurEventsCallback(onBlur?: (e?: FocusEvent) => void) {
    const { metricNameCreatedEvent } = useEvents(events);

    return useCallback(
        (e?: FocusEvent) => {
            metricNameCreatedEvent();
            if (onBlur) {
                onBlur(e);
            }
        },
        [metricNameCreatedEvent, onBlur],
    );
}
