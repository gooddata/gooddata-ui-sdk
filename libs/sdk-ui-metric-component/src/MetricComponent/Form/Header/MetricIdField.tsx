// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { useEvents } from "../../../shared/eventing/useEvents.js";
import { makeStyles } from "../../../shared/theme/index.js";
import { validateIdPattern } from "../../metric/idValidator.js";
import { FormField } from "../data.js";
import { InlineEditableValue } from "../EditableRow/InlineEditableValue.js";
import { events } from "../EditMetricContentForm.events.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";
import { useUniqIdGenerator } from "../hooks/useUniqIdGenerator.js";

const ROW_HEIGHT = 29;
const ID_MIN_WIDTH = 64;

const useStyles = makeStyles()((theme) => ({
    root: {
        display: "flex",
        minWidth: 0,
        alignItems: "center",
        color: theme.globals.colors.defaultStateBlank,
        lineHeight: "21px",
        flexShrink: 1,
        marginRight: 5,
        minHeight: ROW_HEIGHT,
    },
    idRow: {
        color: theme.globals.colors.link,
        minHeight: ROW_HEIGHT,
    },
}));

export interface IMetricIdFieldProps {
    regenerateId?: boolean;
    className?: string;
}

export function MetricIdField({ className, regenerateId }: IMetricIdFieldProps): ReactElement | null {
    const { classes, cx } = useStyles();
    const intl = useIntl();

    const { value, element, error, valid, isReadOnly, isLocked, defaultValues, onBlur, onChange } =
        useMetricFormField(FormField.id);
    const prefix = useMetricFormField(FormField.prefix);

    const onBlurHandler = useBlurEventsCallback(defaultValues.id, onBlur);

    const defaultId = useUniqIdGenerator(regenerateId);
    const { trimOrSetDefaultIfEmpty } = useIdSanitizers(defaultId);

    // The row holds before an id exists, so it fills in as the title is typed. Nothing to
    // show and nothing to type into would render a bare "ID:".
    if (isEmpty(value) && isEmpty(defaultId) && (isLocked || isReadOnly)) {
        return null;
    }

    return (
        <div className={cx(classes.root, className, "s-edit_dialog_id")}>
            ID:{" "}
            <InlineEditableValue
                prefix={prefix.value}
                className={classes.idRow}
                size="small"
                minWidth={ID_MIN_WIDTH}
                revealOnHover={false}
                placeholder={defaultId}
                ariaLabel={intl.formatMessage({ id: "metricComponent.editMetric.id.ariaLabel" })}
                onChangeValueTransformer={passOnlyValidOrEmpty}
                onEditEndsValueTransformer={trimOrSetDefaultIfEmpty}
                readOnly={isLocked || isReadOnly}
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

/** Trimmed value if the id pattern allows it or it is empty, otherwise null to reject it. */
export function passOnlyValidOrEmpty(value: string): string | null {
    const idValue = value.trim();
    if (isEmpty(idValue) || validateIdPattern(idValue)) {
        return idValue;
    }

    return null;
}

function useIdSanitizers(defaultId: string) {
    const trimOrSetDefaultIfEmpty = useCallback(
        (value: string) => {
            const idValue = value.trim();
            if (isEmpty(idValue)) {
                return defaultId;
            } else {
                return idValue;
            }
        },
        [defaultId],
    );

    return { trimOrSetDefaultIfEmpty };
}

function useBlurEventsCallback(id?: string, onBlur?: (e?: FocusEvent) => void) {
    const { metricIdCreatedEvent, metricIdEditEvent } = useEvents(events);

    return useCallback(
        (e?: FocusEvent) => {
            if (isEmpty(id)) {
                metricIdCreatedEvent();
            } else {
                metricIdEditEvent();
            }
            if (onBlur) {
                onBlur(e);
            }
        },
        [metricIdCreatedEvent, metricIdEditEvent, onBlur, id],
    );
}
