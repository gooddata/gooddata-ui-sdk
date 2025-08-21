// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    IWidget,
    ObjRef,
    areObjRefsEqual,
    isDashboardDateFilterReference,
    isInsightWidget,
    objRefToString,
} from "@gooddata/sdk-model";
import { IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling.js";
import { selectAllCatalogDateDatasetsMap, useDashboardSelector } from "../../../../model/index.js";
import { useCurrentDateFilterConfig } from "../../../dragAndDrop/index.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

interface IDateFilterConfigurationItemProps {
    widget: IWidget;
    dataSetRef: ObjRef;
}

export function DateFilterConfigurationItem(props: IDateFilterConfigurationItemProps) {
    const { widget, dataSetRef } = props;

    const [isApplied, setIsApplied] = useState(
        () =>
            !widget.ignoreDashboardFilters.some((reference) => {
                if (!isDashboardDateFilterReference(reference)) {
                    return false;
                }
                return areObjRefsEqual(reference.dataSet, dataSetRef);
            }),
    );

    const ddsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);

    const dateDataSetTitle = ddsMap.get(dataSetRef)?.dataSet.title || "Date";

    const { title } = useCurrentDateFilterConfig(dataSetRef, dateDataSetTitle);

    const isFilterNotApplied = false; // Execution warnings are not used on Tiger which only supports Multiple DFs

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
}
