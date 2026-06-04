// (C) 2026 GoodData Corporation

import { useState } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    isDashboardMeasureValueFilterReference,
    objRefToString,
} from "@gooddata/sdk-model";
import { UiTooltip } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { FilterConfigurationItemLabel } from "./FilterConfigurationItemLabel.js";
import { useMeasureValueFilterConfigurationHandling } from "./useMeasureValueFilterConfigurationHandling.js";

interface IMeasureValueFilterConfigurationItemProps {
    widget: IWidget;
    measureRef: ObjRef;
    title: string;
    isCompatible: boolean;
    isBlockedByRankingFilter: boolean;
    isMissingMeasure?: boolean;
}

export function MeasureValueFilterConfigurationItem({
    widget,
    measureRef,
    title,
    isCompatible,
    isBlockedByRankingFilter,
    isMissingMeasure = false,
}: IMeasureValueFilterConfigurationItemProps) {
    const [isApplied, setIsApplied] = useState(
        () =>
            !widget.ignoreDashboardFilters.some((reference) => {
                if (!isDashboardMeasureValueFilterReference(reference)) {
                    return false;
                }
                return areObjRefsEqual(reference.measure, measureRef);
            }),
    );

    const { handleIgnoreChanged, status } = useMeasureValueFilterConfigurationHandling(
        widget,
        measureRef,
        setIsApplied,
    );

    const isLoading = status === "loading";
    const isIncompatible = !isCompatible;
    const isDisabled = isIncompatible || isBlockedByRankingFilter || isMissingMeasure;
    const isChecked = !isDisabled && isApplied;

    const classNames = cx(
        `s-${simplifyText(title)}`,
        "input-checkbox-label",
        "filter-by-item",
        "attribute-filter-by-item",
        "measure-value-filter-by-item",
        {
            "filter-by-item-incompatible": isIncompatible || isBlockedByRankingFilter,
            "filter-by-item-missing-measure": isMissingMeasure,
            disabled: isDisabled,
        },
    );

    const uniqueKey = objRefToString(measureRef);

    const checkbox = (
        <FilterConfigurationItemLabel
            dataTestId={`s-${simplifyText(title)}`}
            className={classNames}
            uniqueKey={uniqueKey}
            title={title}
            isApplied={isChecked}
            isLoading={isLoading}
            disabled={isDisabled}
            onChange={handleIgnoreChanged}
        />
    );

    if (!isDisabled) {
        return <div>{checkbox}</div>;
    }

    // Priority: missing measure > incompatible > blocked by ranking filter
    const tooltipContent = isMissingMeasure ? (
        <FormattedMessage id="configurationPanel.mvfMissingMeasure" />
    ) : isIncompatible ? (
        <FormattedMessage id="configurationPanel.vizCantBeFilteredByMeasureValueFilter" />
    ) : (
        <FormattedMessage id="configurationPanel.mvfBlockedByRankingFilter" />
    );

    return (
        <div>
            <UiTooltip
                arrowPlacement="top-start"
                triggerBy={["hover", "focus"]}
                optimalPlacement
                anchor={checkbox}
                content={tooltipContent}
            />
        </div>
    );
}
