// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo, useCallback, useMemo } from "react";

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { type MetricType } from "@gooddata/sdk-model";
import { Button, Dropdown, DropdownList, SingleSelectListItem } from "@gooddata/sdk-ui-kit";

import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    label: {
        fontSize: "14px",
        color: theme.globals.colors.description,
    },
    dropdownButton: {
        minWidth: 120,
    },
}));

const METRIC_TYPE_OPTIONS: Array<{ value: MetricType | undefined; labelKey: string }> = [
    { value: undefined, labelKey: defineMessage({ id: "metricComponent.metricType.unspecified" }).id },
    { value: "CURRENCY", labelKey: defineMessage({ id: "metricComponent.metricType.currency" }).id },
];

export interface IMetricTypeFieldProps {
    className?: string;
}

function MetricTypeFieldComponent({ className }: IMetricTypeFieldProps): ReactElement | null {
    const { classes, cx } = useStyles();
    const intl = useIntl();

    const { value, isReadOnly, isLocked, setValue } = useMetricFormField(FormField.metricType);

    const metricTypeValue = value;

    const selectedOption = useMemo(
        () => METRIC_TYPE_OPTIONS.find((opt) => opt.value === metricTypeValue) ?? METRIC_TYPE_OPTIONS[0],
        [metricTypeValue],
    );

    const handleChange = useCallback(
        (newValue: MetricType | undefined) => {
            setValue(newValue);
        },
        [setValue],
    );

    const disabled = isLocked || isReadOnly;

    return (
        <div className={cx(classes.root, className, "s-metric-type-field")}>
            <div className={classes.label}>
                <FormattedMessage id="metricComponent.metricType.label" />
            </div>
            <Dropdown
                alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        width={200}
                        items={METRIC_TYPE_OPTIONS}
                        renderItem={({ item }) => (
                            <SingleSelectListItem
                                title={intl.formatMessage({ id: item.labelKey })}
                                isSelected={item.value === metricTypeValue}
                                onClick={() => {
                                    handleChange(item.value);
                                    closeDropdown();
                                }}
                            />
                        )}
                    />
                )}
                renderButton={({ toggleDropdown, isOpen }) => (
                    <Button
                        className={cx("gd-button-secondary", classes.dropdownButton)}
                        value={intl.formatMessage({ id: selectedOption.labelKey })}
                        iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                        onClick={toggleDropdown}
                        disabled={disabled}
                    />
                )}
            />
        </div>
    );
}

export const MetricTypeField = memo(MetricTypeFieldComponent);
