// (C) 2020-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import { IAttributeFilter, filterObjRef } from "@gooddata/sdk-model";

import { DisplayFormParam } from "./DisplayFormParam.js";
import { selectAllCatalogDisplayFormsMap, useDashboardSelector } from "../../../../../model/index.js";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { IAttributeWithDisplayForm, IParametersPanelSectionsCommonProps } from "../types.js";

export interface IInsightParametersSectionProps extends IParametersPanelSectionsCommonProps {
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    loadingAttributeDisplayForms: boolean;
    insightFilters?: IAttributeFilter[];
}

export const InsightParametersSection: React.FC<IInsightParametersSectionProps> = ({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    insightFilters,
    onAdd,
}) => {
    const catalogDisplayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    return (
        <>
            {(attributeDisplayForms && attributeDisplayForms.length > 0) ||
            loadingAttributeDisplayForms ||
            (insightFilters && insightFilters.length > 0) ? (
                <>
                    <DropdownSectionHeader>
                        <FormattedMessage id="configurationPanel.drillIntoUrl.editor.insightParametersSectionLabel" />
                    </DropdownSectionHeader>
                    {loadingAttributeDisplayForms ? (
                        <div className="gd-drill-to-url-section-loading s-drill-to-custom-url-attr-section-loading">
                            <div className="gd-spinner small" />
                        </div>
                    ) : (
                        attributeDisplayForms?.map((item) => (
                            <DisplayFormParam
                                key={item.displayForm.id}
                                item={item.displayForm}
                                onAdd={onAdd}
                            />
                        ))
                    )}
                    {insightFilters?.map((filter, index) => {
                        const displayFormRef = filterObjRef(filter);
                        const df = catalogDisplayForms.get(displayFormRef);

                        return (
                            df && (
                                <DisplayFormParam
                                    item={df}
                                    onAdd={() => onAdd(`{attribute_filter_selection(${df.id})}`)}
                                    iconClassName="gd-icon-filter"
                                    key={index}
                                    isFilter
                                />
                            )
                        );
                    })}
                </>
            ) : null}
        </>
    );
};
