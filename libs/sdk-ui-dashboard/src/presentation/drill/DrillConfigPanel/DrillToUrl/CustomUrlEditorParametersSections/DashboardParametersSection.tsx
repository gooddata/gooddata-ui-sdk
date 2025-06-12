// (C) 2020-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { DisplayFormParam } from "./DisplayFormParam.js";
import {
    IAttributeFilter,
    filterObjRef,
    IDashboardAttributeFilterConfig,
    filterLocalIdentifier,
} from "@gooddata/sdk-model";
import { IParametersPanelSectionsCommonProps } from "../types.js";

export interface IDashboardParametersSectionProps extends IParametersPanelSectionsCommonProps {
    dashboardFilters?: IAttributeFilter[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

export const DashboardParametersSection: React.FC<IDashboardParametersSectionProps> = ({
    dashboardFilters,
    attributeFilterConfigs,
    onAdd,
}) => {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const enableDuplicatedLabelValuesInAttributeFilter = useDashboardSelector(
        selectEnableDuplicatedLabelValuesInAttributeFilter,
    );

    return dashboardFilters && dashboardFilters.length > 0 ? (
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
                    <React.Fragment key={index}>
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
                        {enableDuplicatedLabelValuesInAttributeFilter && secondaryDf && areDfsDifferent ? (
                            <DisplayFormParam
                                item={secondaryDf}
                                iconClassName="gd-icon-filter"
                                onAdd={() => {
                                    onAdd(`{dash_attribute_filter_selection(${filterSecondaryIdentifier})}`);
                                }}
                                isFilter
                            />
                        ) : null}
                    </React.Fragment>
                );
            })}
        </>
    ) : null;
};
