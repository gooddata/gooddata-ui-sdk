// (C) 2020-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import {
    type IAttributeFilter,
    type IMeasure,
    type IMeasureValueFilter,
    type ObjRef,
    type ObjRefInScope,
    areObjRefsEqual,
    filterObjRef,
    insightMeasures,
    isLocalIdRef,
    measureAlias,
    measureItem,
    measureLocalId,
    measureTitle,
    objRefToString,
} from "@gooddata/sdk-model";
import { MeasureValueFilterDetailsBubble } from "@gooddata/sdk-ui-filters/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectInsightByWidgetRef } from "../../../../../model/store/insights/insightsSelectors.js";
import { DropdownSectionHeader } from "../DropdownSectionHeader.js";
import { type IAttributeWithDisplayForm, type IParametersPanelSectionsCommonProps } from "../types.js";

import { DisplayFormParam } from "./DisplayFormParam.js";
import { Parameter } from "./Parameter.js";

export interface IInsightParametersSectionProps extends IParametersPanelSectionsCommonProps {
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    loadingAttributeDisplayForms: boolean;
    insightFilters?: IAttributeFilter[];
    insightMeasureValueFilters?: IMeasureValueFilter[];
    widgetRef: ObjRef;
}

export function InsightParametersSection({
    attributeDisplayForms,
    loadingAttributeDisplayForms,
    insightFilters,
    insightMeasureValueFilters,
    widgetRef,
    intl,
    onAdd,
}: IInsightParametersSectionProps) {
    const catalogDisplayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const catalogMeasuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const insight = useDashboardSelector(selectInsightByWidgetRef(widgetRef));
    const measures = insight ? insightMeasures(insight) : [];

    return (
        <>
            {(attributeDisplayForms && attributeDisplayForms.length > 0) ||
            loadingAttributeDisplayForms ||
            (insightFilters && insightFilters.length > 0) ||
            (insightMeasureValueFilters && insightMeasureValueFilters.length > 0) ? (
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
                    {insightMeasureValueFilters?.map((filter) => {
                        const { measure, localIdentifier } = filter.measureValueFilter;
                        const insightMeasure = getInsightMeasure(measure, measures);
                        const insightMeasureItem = insightMeasure ? measureItem(insightMeasure) : undefined;
                        const catalogMeasure = isLocalIdRef(measure)
                            ? insightMeasureItem && catalogMeasuresMap.get(insightMeasureItem)
                            : catalogMeasuresMap.get(measure);
                        const measureIdentifier = objRefToString(measure);
                        const resolvedTitle =
                            getInsightMeasureTitle(insightMeasure) ??
                            catalogMeasure?.measure.title ??
                            measureIdentifier;

                        return (
                            <Parameter
                                key={localIdentifier ?? measureIdentifier}
                                name={resolvedTitle}
                                description={measureIdentifier}
                                detailTrigger={
                                    <MeasureValueFilterDetailsBubble
                                        title={resolvedTitle}
                                        requestHandler={
                                            catalogMeasure ? async () => catalogMeasure.measure : undefined
                                        }
                                    />
                                }
                                iconClassName="gd-icon-filter"
                                onAdd={() => {
                                    onAdd(`{mvf_condition(${measureIdentifier})}`);
                                }}
                                intl={intl}
                            />
                        );
                    })}
                </>
            ) : null}
        </>
    );
}

function getInsightMeasureTitle(measure: IMeasure | undefined) {
    return measure ? (measureAlias(measure) ?? measureTitle(measure)) : undefined;
}

function getInsightMeasure(measureRef: ObjRefInScope, measures: IMeasure[]) {
    if (isLocalIdRef(measureRef)) {
        return measures.find((measure) => measureLocalId(measure) === measureRef.localIdentifier);
    }

    return measures.find((measure) => {
        const item = measureItem(measure);
        return item ? areObjRefsEqual(item, measureRef) : false;
    });
}
