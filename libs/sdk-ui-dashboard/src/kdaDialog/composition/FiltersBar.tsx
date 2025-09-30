// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { selectAttributeFilterConfigsOverrides, useDashboardSelector } from "../../model/index.js";
import { AttributeBar } from "../components/bars/AttributeBar.js";
import { DateBar } from "../components/bars/DateBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { KdaDateFilter } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export function FiltersBar() {
    const intl = useIntl();

    const attributeConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);

    const { state, setState } = useKdaState();

    const onChangeAttributeFilter = useCallback((newFilter: IDashboardAttributeFilter) => {
        // eslint-disable-next-line
        console.log("on Change Attribute Filter", newFilter);
        //TODO: onChangeAttributeFilter
    }, []);

    const onDeleteAttributeFilter = useCallback((filter: IDashboardAttributeFilter) => {
        // eslint-disable-next-line
        console.log("on Delete Attribute Filter", filter);
        //TODO: onDeleteAttributeFilter
    }, []);

    const onPeriodChange = useCallback(
        (item: KdaDateFilter, period: KdaDateFilter["selectedPeriod"]) => {
            // eslint-disable-next-line
            console.log("on Period Change", period);
            //TODO: onPeriodChange
            const i = state.dateFilters.indexOf(item);
            const newDateFilters = [...state.dateFilters];
            newDateFilters[i] = {
                ...item,
                selectedPeriod: period,
            };
            setState({
                dateFilters: newDateFilters,
            });
        },
        [setState, state.dateFilters],
    );

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.filters.title" })}
            content={
                <>
                    {state.dateFilters.map((dateFilter, i) => (
                        <DateBar key={i} date={dateFilter} onPeriodChange={onPeriodChange} />
                    ))}
                    {state.attributeFilters.map((attributeFilter, i) => (
                        <AttributeBar
                            key={i}
                            attribute={attributeFilter}
                            attributeConfigs={attributeConfigs}
                            onChange={onChangeAttributeFilter}
                            onDelete={onDeleteAttributeFilter}
                        />
                    ))}
                </>
            }
        />
    );
}
