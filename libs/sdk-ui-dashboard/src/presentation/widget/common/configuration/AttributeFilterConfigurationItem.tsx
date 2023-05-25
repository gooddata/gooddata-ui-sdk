// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    isDashboardAttributeFilterReference,
    isInsightWidget,
    IWidget,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { selectAttributeFilterDisplayFormsMap, useDashboardSelector } from "../../../../model/index.js";
import { useAttributeFilterConfigurationHandling } from "./useAttributeFilterConfigurationHandling.js";
import { useIsFilterNotApplied } from "./useIsFilterNotApplied.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

interface IAttributeFilterConfigurationItemProps {
    widget: IWidget;
    displayFormRef: ObjRef;
    title: string;
}

export const AttributeFilterConfigurationItem: React.FC<IAttributeFilterConfigurationItemProps> = (props) => {
    const { widget, displayFormRef, title } = props;

    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);

    const [isApplied, setIsApplied] = useState(
        () =>
            !widget.ignoreDashboardFilters.some((reference) => {
                if (!isDashboardAttributeFilterReference(reference)) {
                    return false;
                }
                const df = dfMap.get(reference.displayForm);
                return areObjRefsEqual(df?.ref, displayFormRef);
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
        `s-${stringUtils.simplifyText(title)}`,
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
            <label className={classNames} htmlFor={uniqueKey}>
                <input
                    id={uniqueKey}
                    type="checkbox"
                    className="input-checkbox"
                    checked={isApplied}
                    onChange={(e) => handleIgnoreChanged(e.target.checked)}
                />
                <span className="input-label-text">
                    <ShortenedText tooltipAlignPoints={tooltipAlignPoints} tagName="span" className="title">
                        {title}
                    </ShortenedText>
                </span>
                {isLoading ? <div className="gd-spinner small" /> : null}
            </label>
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
};
