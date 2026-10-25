// (C) 2019-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-model";
import { type IDimensionalityItem, getMeasureValueFilterConditionLabel } from "@gooddata/sdk-ui-filters";

import { type MeasureValueFilterCondition } from "../../../store/filter_bar/filter_bar_types.js";

export interface IDropdownButtonValueOwnProps {
    condition?: MeasureValueFilterCondition;
    conditions?: MeasureValueFilterCondition[];
    usePercentage: boolean;
    separators?: ISeparators;
    dimensionality?: IDimensionalityItem[];
}

/**
 * Concatenates dimensionality titles into a readable string.
 * Example: ["Product"] -\> "Product"
 * Example: ["Product", "Brand"] -\> "Product, Brand"
 * Example: ["Product", "Brand", "Region"] -\> "Product, Brand, Region"
 */
const concatDimensionalityTitles = (items: IDimensionalityItem[]): string | undefined => {
    const titles = items.map((item) => item.title).filter(Boolean);
    if (titles.length === 0) {
        return undefined;
    }
    if (titles.length === 1) {
        return titles[0];
    }
    return titles.join(", ");
};

export function DropdownButtonValue({
    condition,
    conditions,
    usePercentage,
    separators,
    dimensionality,
}: IDropdownButtonValueOwnProps) {
    const intl = useIntl();

    const dimensionalityTitles = useMemo(() => {
        if (!dimensionality?.length) {
            return undefined;
        }
        return concatDimensionalityTitles(dimensionality);
    }, [dimensionality]);

    const conditionLabel = useMemo(() => {
        const effectiveConditions = conditions?.length ? conditions : condition ? [condition] : undefined;
        return getMeasureValueFilterConditionLabel(intl, effectiveConditions, {
            usePercentage,
            separators,
        });
    }, [intl, condition, conditions, usePercentage, separators]);

    if (dimensionalityTitles) {
        return intl.formatMessage(
            { id: "measure_value_filter.configuration.withDimensionality" },
            { condition: conditionLabel, dimensionality: dimensionalityTitles },
        );
    }
    return conditionLabel;
}
