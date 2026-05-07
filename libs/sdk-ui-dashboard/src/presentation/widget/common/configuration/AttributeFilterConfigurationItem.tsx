// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilterReference,
    isInsightWidget,
    objRefToString,
} from "@gooddata/sdk-model";
import { simplifyText } from "@gooddata/util";

import { useAttributeFilterDisplayFormFromMap } from "../../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import { FilterConfigurationItemLabel } from "./FilterConfigurationItemLabel.js";
import { useAttributeFilterConfigurationHandling } from "./useAttributeFilterConfigurationHandling.js";
import { useIsFilterNotApplied } from "./useIsFilterNotApplied.js";

interface IAttributeFilterConfigurationItemProps {
    widget: IWidget;
    displayFormRef: ObjRef;
    displayAsLabel?: ObjRef;
    title: string;
}

export function AttributeFilterConfigurationItem({
    widget,
    displayFormRef,
    displayAsLabel,
    title,
}: IAttributeFilterConfigurationItemProps) {
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();

    const [isApplied, setIsApplied] = useState(
        () =>
            !widget.ignoreDashboardFilters.some((reference) => {
                if (!isDashboardAttributeFilterReference(reference)) {
                    return false;
                }
                const df = getAttributeFilterDisplayFormFromMap(reference.displayForm);
                return areObjRefsEqual(df?.ref, displayFormRef) || areObjRefsEqual(df?.ref, displayAsLabel);
            }),
    );

    const isFilterNotApplied = useIsFilterNotApplied(widget, displayFormRef);

    const { handleIgnoreChanged, status } = useAttributeFilterConfigurationHandling(
        widget,
        displayFormRef,
        setIsApplied,
    );

    const isError = isApplied && (status === "error" || isFilterNotApplied);
    const isLoading = status === "loading";

    const classNames = cx(
        "s-attribute-filter-by-item",
        `s-${simplifyText(title)}`,
        "input-checkbox-label",
        "filter-by-item",
        "attribute-filter-by-item",
        {
            "attribute-filter-error": isError,
        },
    );

    const uniqueKey = objRefToString(displayFormRef);

    return (
        <div>
            <FilterConfigurationItemLabel
                className={classNames}
                uniqueKey={uniqueKey}
                title={title}
                isApplied={isApplied}
                isLoading={isLoading}
                onChange={handleIgnoreChanged}
            />
            {!!isError && (
                <div className="gd-message error s-not-applied-attribute-filter">
                    {isInsightWidget(widget) ? (
                        <FormattedMessage
                            id="configurationPanel.vizCantBeFilteredByAttribute"
                            values={{ attributeName: title }}
                        />
                    ) : (
                        <FormattedMessage
                            id="configurationPanel.kpiCantBeFilteredByAttribute"
                            values={{ attributeName: title }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
