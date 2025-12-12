// (C) 2020-2025 GoodData Corporation

import { Fragment } from "react";

import { FormattedMessage } from "react-intl";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    filterLocalIdentifier,
    filterObjRef,
} from "@gooddata/sdk-model";

import { DisplayFormParam } from "./DisplayFormParam.js";
import { selectAllCatalogDisplayFormsMap, useDashboardSelector } from "../../../../../model/index.js";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { type IParametersPanelSectionsCommonProps } from "../types.js";

export interface IDashboardParametersSectionProps extends IParametersPanelSectionsCommonProps {
    dashboardFilters?: IAttributeFilter[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
}

export function DashboardParametersSection({
    dashboardFilters,
    attributeFilterConfigs,
    onAdd,
}: IDashboardParametersSectionProps) {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);

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
        </>
    ) : null;
}
