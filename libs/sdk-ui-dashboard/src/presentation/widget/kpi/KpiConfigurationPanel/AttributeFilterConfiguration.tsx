// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import {
    isDashboardAttributeFilterReference,
    isInsightWidget,
    IWidget,
    ObjRef,
    objRefToString,
    widgetRef,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import {
    ignoreFilterOnInsightWidget,
    ignoreFilterOnKpiWidget,
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
    unignoreFilterOnInsightWidget,
    unignoreFilterOnKpiWidget,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model";
import { AttributeFilterConfigurationItem } from "./AttributeFilterConfigurationItem";

interface IAttributeFilterConfigurationProps {
    widget: IWidget;
}

export const AttributeFilterConfiguration: React.FC<IAttributeFilterConfigurationProps> = (props) => {
    const { widget } = props;
    const attributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);

    const dispatch = useDashboardDispatch();

    const ignoredDisplayForms = widget.ignoreDashboardFilters
        .filter(isDashboardAttributeFilterReference)
        .map((ignored) => dfMap.get(ignored.displayForm));

    const handleIgnoreChanged = useCallback(
        (filterDisplayFormRef: ObjRef, ignored: boolean) => {
            if (isInsightWidget(widget)) {
                if (ignored) {
                    dispatch(ignoreFilterOnInsightWidget(widgetRef(widget), filterDisplayFormRef));
                } else {
                    dispatch(unignoreFilterOnInsightWidget(widgetRef(widget), filterDisplayFormRef));
                }
            } else {
                if (ignored) {
                    dispatch(ignoreFilterOnKpiWidget(widgetRef(widget), filterDisplayFormRef));
                } else {
                    dispatch(unignoreFilterOnKpiWidget(widgetRef(widget), filterDisplayFormRef));
                }
            }
        },
        [dispatch, widget],
    );

    return (
        <div>
            {attributeFilters.map((filter) => {
                const displayForm = dfMap.get(filter.attributeFilter.displayForm);
                invariant(displayForm, "Inconsistent state in AttributeFilterConfiguration");

                const attribute = attrMap.get(displayForm.attribute);
                invariant(attribute, "Inconsistent state in AttributeFilterConfiguration");

                const isIgnored = ignoredDisplayForms.includes(displayForm);

                return (
                    <AttributeFilterConfigurationItem
                        key={objRefToString(displayForm.ref)}
                        displayFormRef={displayForm.ref}
                        attributeRef={displayForm.attribute}
                        isIgnored={isIgnored}
                        title={attribute.attribute.title}
                        notAppliedFiltersRefs={[]} // TODO
                        recentlyCheckedFilters={[]} // TODO
                        onIgnoreChange={handleIgnoreChanged}
                        widget={widget}
                    />
                );
            })}
        </div>
    );
};
