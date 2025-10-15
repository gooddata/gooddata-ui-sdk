// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { IDashboardAttributeFilter, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    selectAttributeFilterConfigsOverrides,
    selectCatalogDateAttributes,
    useDashboardSelector,
} from "../../model/index.js";
import { AttributeBar } from "../components/bars/AttributeBar.js";
import { DateBar } from "../components/bars/DateBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { KdaDateOptions } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";
import { KdaPeriodType } from "../types.js";

export function FiltersBar() {
    const intl = useIntl();

    const dateAttributes = useDashboardSelector(selectCatalogDateAttributes);
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
        (type: KdaPeriodType) => {
            // eslint-disable-next-line
            console.log("on Period Change", type);
            //TODO: onPeriodChange
            if (state.definition) {
                setState({
                    definition: {
                        ...state.definition,
                        type,
                    },
                });
            }
        },
        [setState, state.definition],
    );

    const def = state.definition;
    const options = useMemo((): KdaDateOptions => {
        const dateAttribute = dateAttributes.find(
            (a) =>
                areObjRefsEqual(def?.dateAttribute, a.attribute.ref) ||
                a.attribute.displayForms.some((df) => areObjRefsEqual(df.ref, def?.dateAttribute)),
        );
        return {
            dateAttribute,
            period: def?.type ?? "previous_period",
            range: def?.range,
        };
    }, [def?.dateAttribute, def?.range, def?.type, dateAttributes]);

    //TODO: AttributesDropdown will be used to add new filter

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.filters.title" })}
            content={
                <>
                    <DateBar options={options} onPeriodChange={onPeriodChange} />
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
