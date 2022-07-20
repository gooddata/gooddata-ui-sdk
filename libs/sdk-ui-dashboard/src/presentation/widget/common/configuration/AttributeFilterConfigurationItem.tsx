// (C) 2022 GoodData Corporation
import React, { useCallback, useState } from "react";
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
    widgetRef,
} from "@gooddata/sdk-model";

import {
    ignoreFilterOnInsightWidget,
    ignoreFilterOnKpiWidget,
    selectAttributeFilterDisplayFormsMap,
    unignoreFilterOnInsightWidget,
    unignoreFilterOnKpiWidget,
    useDashboardCommandProcessing,
    useDashboardSelector,
} from "../../../../model";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef";

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
    const [status, setStatus] = useState<"ok" | "error" | "loading">("ok");

    const ref = widgetRef(widget);

    const { run: ignoreKpiFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreFilterOnKpiWidget,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsApplied(false);
        },
    });

    const { run: unignoreKpiFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreFilterOnKpiWidget,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsApplied(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: (_command) => {
            setStatus("ok");
        },
    });

    const { run: ignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsApplied(false);
        },
    });

    const { run: unignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsApplied(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: (_command) => {
            setStatus("ok");
        },
    });

    const handleIgnoreChanged = useCallback(
        (ignored: boolean) => {
            if (isInsightWidget(widget)) {
                if (ignored) {
                    unignoreInsightFilter(ref, displayFormRef);
                } else {
                    ignoreInsightFilter(ref, displayFormRef);
                }
            } else {
                if (ignored) {
                    unignoreKpiFilter(ref, displayFormRef);
                } else {
                    ignoreKpiFilter(ref, displayFormRef);
                }
            }
        },
        [
            isInsightWidget(widget),
            safeSerializeObjRef(displayFormRef),
            safeSerializeObjRef(ref),
            ignoreInsightFilter,
            ignoreKpiFilter,
            unignoreInsightFilter,
            unignoreKpiFilter,
        ],
    );

    const isError = status === "error";
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
                {isLoading && <div className="gd-spinner small" />}
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
