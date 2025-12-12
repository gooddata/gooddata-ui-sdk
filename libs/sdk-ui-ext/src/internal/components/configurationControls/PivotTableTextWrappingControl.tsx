// (C) 2025 GoodData Corporation

import { type ChangeEvent, useCallback, useMemo } from "react";

import { cloneDeep } from "lodash-es";
import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";
import { UiCheckbox } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";

/**
 * Minimal type for column text wrapping items in properties.
 * @internal
 */
interface IColumnTextWrappingItem {
    wrapText?: boolean;
    wrapHeaderText?: boolean;
}

/**
 * @internal
 */
export interface ITextWrappingControlProps {
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
    disabled?: boolean;
}

interface ITextWrappingCheckboxProps extends ITextWrappingControlProps {
    wrapType: "wrapHeaderText" | "wrapText";
    messageKey: "columnHeaderWrapText" | "cellsWrapText";
    testId: string;
}

/**
 * Single text wrapping checkbox control.
 * Supports tri-state checkbox that shows indeterminate when global is ON but column overrides exist.
 *
 * @internal
 */
function TextWrappingCheckbox({
    properties,
    pushData,
    disabled = false,
    wrapType,
    messageKey,
    testId,
}: ITextWrappingCheckboxProps) {
    const intl = useIntl();
    const textWrapping = properties?.controls?.["textWrapping"] ?? {};
    const columnOverrides = useMemo(
        () => textWrapping?.columnOverrides ?? [],
        [textWrapping?.columnOverrides],
    );

    // Determine checkbox state
    const checked = !!textWrapping?.[wrapType];

    // Indeterminate state: global is ON but some columns have it turned OFF
    // This represents "mostly on, but with exceptions"
    const hasOverrides = useMemo(
        () =>
            checked &&
            columnOverrides.some((item: IColumnTextWrappingItem) => {
                const overrideValue = item[wrapType];
                // Only count as override if explicitly set to false when global is true
                return overrideValue !== undefined && !overrideValue;
            }),
        [columnOverrides, wrapType, checked],
    );

    const indeterminate = hasOverrides;

    // Update global wrapping setting and clear corresponding overrides
    const updateWrapping = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const clonedProperties = cloneDeep(properties) || {};
            clonedProperties.controls = clonedProperties.controls || {};

            const currentTextWrapping = clonedProperties.controls["textWrapping"] || {};
            const currentOverrides = currentTextWrapping.columnOverrides ?? [];

            // Clear the corresponding override property from all overrides
            // If changing wrapText, clear wrapText from overrides but keep wrapHeaderText
            // If changing wrapHeaderText, clear wrapHeaderText from overrides but keep wrapText
            const cleanedOverrides = currentOverrides
                .map((item: IColumnTextWrappingItem) => {
                    const { [wrapType]: _, ...rest } = item;
                    return rest;
                })
                .filter((item: Partial<IColumnTextWrappingItem>) => {
                    // Remove empty override objects (those with no properties)
                    return Object.keys(item).some((key) => {
                        const value = item[key as keyof IColumnTextWrappingItem];
                        return value !== undefined;
                    });
                });

            clonedProperties.controls["textWrapping"] = {
                ...currentTextWrapping,
                [wrapType]: event.target.checked,
                columnOverrides: cleanedOverrides,
            };

            pushData({ properties: clonedProperties });
        },
        [properties, pushData, wrapType],
    );

    const label = intl.formatMessage(messages[messageKey]);

    return (
        <div className={`s-pivot-text-wrapping-${testId} gd-pivot-text-wrapping-checkbox`}>
            <UiCheckbox
                checked={checked}
                indeterminate={indeterminate}
                disabled={disabled}
                onChange={updateWrapping}
                label={label}
            />
        </div>
    );
}

/**
 * Header text wrapping control for PivotTableNext Column Headers section.
 *
 * @internal
 */
export function ColumnHeaderTextWrappingControl({
    properties,
    pushData,
    disabled = false,
}: ITextWrappingControlProps) {
    return (
        <TextWrappingCheckbox
            properties={properties}
            pushData={pushData}
            disabled={disabled}
            wrapType="wrapHeaderText"
            messageKey="columnHeaderWrapText"
            testId="header"
        />
    );
}

/**
 * Cell text wrapping control for PivotTableNext Cells section.
 *
 * @internal
 */
export function CellTextWrappingControl({
    properties,
    pushData,
    disabled = false,
}: ITextWrappingControlProps) {
    return (
        <TextWrappingCheckbox
            properties={properties}
            pushData={pushData}
            disabled={disabled}
            wrapType="wrapText"
            messageKey="cellsWrapText"
            testId="cells"
        />
    );
}
