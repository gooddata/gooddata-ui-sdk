// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { selectAllCatalogDisplayFormsMap, useDashboardSelector } from "../../../../../model/index.js";
import { DisplayFormParam } from "./DisplayFormParam.js";
import { IAttributeFilter, filterObjRef } from "@gooddata/sdk-model";
import { IParametersPanelSectionsCommonProps } from "../types.js";

export interface IDashboardParametersSectionProps extends IParametersPanelSectionsCommonProps {
    dashboardFilters?: IAttributeFilter[];
}

export const DashboardParametersSection: React.FC<IDashboardParametersSectionProps> = ({
    dashboardFilters,
    onAdd,
}) => {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return (
        <>
            <DropdownSectionHeader>
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.dashboardParametersSectionLabel" />
            </DropdownSectionHeader>
            {dashboardFilters?.map((filter, index) => {
                const df = catalogDisplayFormsMap.get(filterObjRef(filter));
                const filterIdentifier = df?.id;

                return df ? (
                    <DisplayFormParam
                        key={index}
                        item={df}
                        iconClassName="gd-icon-filter"
                        onAdd={() => {
                            onAdd(`{dash_attribute_filter_selection(${filterIdentifier})}`);
                        }}
                        isFilter
                    />
                ) : null;
            })}
        </>
    );
};
