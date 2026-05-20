// (C) 2020-2026 GoodData Corporation

import { Fragment } from "react";

import { FormattedMessage } from "react-intl";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardMeasureValueFilter,
    filterLocalIdentifier,
    filterObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { MeasureValueFilterDetailsBubble } from "@gooddata/sdk-ui-filters/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { type IParametersPanelSectionsCommonProps } from "../types.js";

import { DisplayFormParam } from "./DisplayFormParam.js";
import { Parameter } from "./Parameter.js";

export interface IDashboardParametersSectionProps extends IParametersPanelSectionsCommonProps {
    dashboardFilters?: IAttributeFilter[];
    dashboardMeasureValueFilters?: IDashboardMeasureValueFilter[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

export function DashboardParametersSection({
    dashboardFilters,
    dashboardMeasureValueFilters,
    attributeFilterConfigs,
    intl,
    onAdd,
}: IDashboardParametersSectionProps) {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const catalogMeasuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);

    const hasAttributeFilters = !!dashboardFilters?.length;
    const hasMeasureValueFilters = !!dashboardMeasureValueFilters?.length;

    return hasAttributeFilters || hasMeasureValueFilters ? (
        <>
            <DropdownSectionHeader>
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.dashboardParametersSectionLabel" />
            </DropdownSectionHeader>
            {dashboardFilters?.map((filter, index) => {
                const df = catalogDisplayFormsMap.get(filterObjRef(filter));
                const filterIdentifier = df?.id;

                const config = attributeFilterConfigs?.find(
                    (c) => c.localIdentifier === filterLocalIdentifier(filter),
                );

                const secondaryDf = config?.displayAsLabel
                    ? catalogDisplayFormsMap.get(config?.displayAsLabel)
                    : undefined;

                const filterSecondaryIdentifier = secondaryDf?.id;

                const areDfsDifferent = filterIdentifier !== filterSecondaryIdentifier;

                return (
                    <Fragment key={index}>
                        {df ? (
                            <DisplayFormParam
                                item={df}
                                iconClassName="gd-icon-filter"
                                onAdd={() => {
                                    onAdd(`{dash_attribute_filter_selection(${filterIdentifier})}`);
                                }}
                                isFilter
                            />
                        ) : null}
                        {secondaryDf && areDfsDifferent ? (
                            <DisplayFormParam
                                item={secondaryDf}
                                iconClassName="gd-icon-filter"
                                onAdd={() => {
                                    onAdd(`{dash_attribute_filter_selection(${filterSecondaryIdentifier})}`);
                                }}
                                isFilter
                            />
                        ) : null}
                    </Fragment>
                );
            })}
            {dashboardMeasureValueFilters?.map((filter) => {
                const { measure, localIdentifier, title } = filter.dashboardMeasureValueFilter;
                const catalogMeasure = catalogMeasuresMap.get(measure);
                const measureIdentifier = catalogMeasure?.measure.id ?? objRefToString(measure);
                const measureTitle = title ?? catalogMeasure?.measure.title ?? measureIdentifier;

                return (
                    <Parameter
                        key={localIdentifier}
                        name={measureTitle}
                        description={measureIdentifier}
                        detailTrigger={
                            <MeasureValueFilterDetailsBubble
                                title={measureTitle}
                                requestHandler={
                                    catalogMeasure ? async () => catalogMeasure.measure : undefined
                                }
                            />
                        }
                        iconClassName="gd-icon-filter"
                        onAdd={() => {
                            onAdd(`{dash_mvf_condition(${measureIdentifier})}`);
                        }}
                        intl={intl}
                    />
                );
            })}
        </>
    ) : null;
}
