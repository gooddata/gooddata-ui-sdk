// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    isDashboardDateFilterReference,
    isInsightWidget,
    IWidget,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

interface IDateFilterConfigurationItemProps {
    widget: IWidget;
    dataSetRef: ObjRef;
    title: string;
}

export const DateFilterConfigurationItem: React.FC<IDateFilterConfigurationItemProps> = (props) => {
    const { widget, dataSetRef, title } = props;

    const [isApplied, setIsApplied] = useState(
        () =>
            !widget.ignoreDashboardFilters.some((reference) => {
                if (!isDashboardDateFilterReference(reference)) {
                    return false;
                }
                return areObjRefsEqual(reference.dataSet, dataSetRef);
            }),
    );

    // TODO INE: add date support
    //const isFilterNotApplied = useIsFilterNotApplied(widget, dataSetRef);
    const isFilterNotApplied = false;

    const { handleIgnoreChanged, status } = useDateFilterConfigurationHandling(
        widget,
        [],
        setIsApplied,
        dataSetRef,
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

    const uniqueKey = objRefToString(dataSetRef);

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
                            id="configurationPanel.vizCantBeFilteredByDate"
                            values={{ attributeName: title }}
                        />
                    ) : (
                        <FormattedMessage
                            id="configurationPanel.kpiCantBeFilteredByDate"
                            values={{ attributeName: title }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
