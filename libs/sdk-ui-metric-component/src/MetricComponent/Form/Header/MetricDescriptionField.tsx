// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IntlShape, useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";

import { makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { EditableRow } from "../EditableRow/EditableRow.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";

const useStyles = makeStyles()(() => ({
    row: {
        "& > div": {
            width: "100%",
        },
    },
}));

export interface IMetricDescriptionFieldProps {
    className?: string;
    onDescriptionHeightChange?: (height: number) => void;
    useReferences?: boolean;
    separators?: ISeparators;
}

export function MetricDescriptionField({
    onDescriptionHeightChange,
    className,
    useReferences,
    separators,
}: IMetricDescriptionFieldProps): ReactElement | null {
    const intl = useIntl();
    const { classes, cx } = useStyles();

    const { value, isReadOnly, onChange } = useMetricFormField(FormField.description);

    return (
        <div className={cx(className, "s-edit_dialog_description")}>
            <EditableRow
                readOnly={isReadOnly}
                className={classes.row}
                placeholder={getDescriptionPlaceholder(intl)}
                autoResize
                onHeightChange={onDescriptionHeightChange}
                value={value}
                onChange={onChange}
                useReferences={useReferences}
                separators={separators}
            />
        </div>
    );
}

function getDescriptionPlaceholder(intl: IntlShape) {
    return intl.formatMessage({
        id: "metricComponent.editMetric.descriptionPlaceholder",
    });
}
