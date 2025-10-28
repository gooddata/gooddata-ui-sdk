// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { AddFilterButton } from "./AddFilterButton.js";
import { selectAttributeFilterConfigsOverrides, useDashboardSelector } from "../../model/index.js";
import { AttributeBar } from "../components/bars/AttributeBar.js";
import { DateBar } from "../components/bars/DateBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { useAttributeFiltersChangeHandler } from "./hooks/useAttributeFiltersChangeHandler.js";
import { usePeriodChangeHandler } from "./hooks/usePeriodChangeHandler.js";

export function FiltersBar() {
    const intl = useIntl();

    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);

    const { attributeFilters, onChangeAttributeFilter, onDeleteAttributeFilter } =
        useAttributeFiltersChangeHandler();
    const { isAvailable, options, onPeriodChange } = usePeriodChangeHandler();

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.filters.title" })}
            content={
                <>
                    <DateBar options={options} isAvailable={isAvailable} onPeriodChange={onPeriodChange} />
                    {attributeFilters.map((attributeFilter, i) => (
                        <AttributeBar
                            key={i}
                            attribute={attributeFilter}
                            attributeConfigs={attributeConfigs}
                            onChange={onChangeAttributeFilter}
                            onDelete={onDeleteAttributeFilter}
                        />
                    ))}
                    <AddFilterButton />
                </>
            }
        />
    );
}
