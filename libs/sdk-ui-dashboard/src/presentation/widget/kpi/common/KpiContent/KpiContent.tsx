// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import Measure from "react-measure";
import { GoodDataSdkError, isGoodDataSdkError, ErrorCodes, ISeparators } from "@gooddata/sdk-ui";
import {
    IFilter,
    isAllTimeDateFilter,
    isDateFilter,
    IKpiWidget,
    IKpiWidgetDefinition,
    isKpiWithComparison,
} from "@gooddata/sdk-model";

import KpiValue from "./KpiValue";
import KpiPop from "./KpiPop";
import { IKpiResult } from "../types";
import { isDateFilterIrrelevant } from "../filterUtils";
import { getKpiPopLabel } from "./utils/translations";

export interface IKpiContentProps {
    // KPI
    kpi: IKpiWidget | IKpiWidgetDefinition;
    isLoading: boolean;
    filters?: IFilter[];
    separators?: ISeparators;
    kpiResult: IKpiResult | undefined;
    error?: GoodDataSdkError | undefined;
    errorHelp?: string;
    enableCompactSize?: boolean;

    // Callbacks
    isKpiUnderlineHiddenWhenClickable?: boolean;
    isKpiValueClickDisabled?: boolean;
    onKpiValueClick?: () => void;
}

class KpiContent extends Component<IKpiContentProps & WrappedComponentProps> {
    static defaultProps: Pick<
        IKpiContentProps,
        "isKpiValueClickDisabled" | "filters" | "isKpiUnderlineHiddenWhenClickable"
    > = {
        isKpiValueClickDisabled: false,
        filters: [],
        isKpiUnderlineHiddenWhenClickable: false,
    };

    renderPeriodOverPeriod(clientWidth?: number, clientHeight?: number) {
        if (this.props.kpi.kpi.comparisonType === "none") {
            return false;
        }

        const { kpiResult, enableCompactSize } = this.props;
        const isDateFilterNotRelevant = isDateFilterIrrelevant(this.props.kpi);
        const isDateFilterAllTime = this.props.filters!.every(
            (f) => !isDateFilter(f) || isAllTimeDateFilter(f),
        );
        const dateFilter = this.props.filters!.find(isDateFilter); // for now we use the first date filter available for this
        const popLabel = getKpiPopLabel(dateFilter, this.props.kpi.kpi.comparisonType, this.props.intl);
        const popDisabled = isDateFilterAllTime || isDateFilterNotRelevant;
        const isSdkError = isGoodDataSdkError(this.props.error);
        const isNoData = isSdkError && this.props.error!.message === ErrorCodes.NO_DATA;

        const comparisonMeaning = isKpiWithComparison(this.props.kpi.kpi)
            ? this.props.kpi.kpi.comparisonDirection
            : undefined;

        return (
            <KpiPop
                disabled={popDisabled}
                isLoading={this.props.isLoading}
                currentPeriodValue={kpiResult?.measureResult ?? null}
                previousPeriodValue={kpiResult?.measureForComparisonResult ?? null} // null === empty result
                previousPeriodName={popLabel}
                format={kpiResult?.measureFormat}
                error={!isNoData ? this.props.error : undefined}
                separators={this.props.separators}
                meaning={comparisonMeaning}
                enableCompactSize={enableCompactSize}
                clientWidth={clientWidth}
                clientHeight={clientHeight}
            />
        );
    }

    renderValue(clientHeight?: number) {
        const { kpiResult, isKpiValueClickDisabled, onKpiValueClick, enableCompactSize, kpi } = this.props;
        const isSdkError = isGoodDataSdkError(this.props.error);
        const isNoData = isSdkError && this.props.error!.message === ErrorCodes.NO_DATA;
        const hasComparison = kpi.kpi.comparisonType !== "none";

        const kpiValue = (
            <KpiValue
                isLoading={this.props.isLoading}
                error={!isNoData ? this.props.error : undefined}
                errorHelp={this.props.errorHelp}
                value={kpiResult?.measureResult ?? null} // null === empty result
                format={kpiResult?.measureFormat}
                separators={this.props.separators}
                disableKpiDrillUnderline={this.props.isKpiUnderlineHiddenWhenClickable}
                enableCompactSize={enableCompactSize}
                clientHeight={clientHeight}
                hasComparison={hasComparison}
            />
        );

        if (onKpiValueClick) {
            if (isKpiValueClickDisabled) {
                return <span className="kpi-link s-kpi-link-nonclickable">{kpiValue}</span>;
            } else {
                return (
                    <a className="kpi-link s-kpi-link-clickable" onClick={this.props.onKpiValueClick}>
                        {kpiValue}
                    </a>
                );
            }
        }

        return kpiValue;
    }

    render() {
        return (
            <div className="gd-kpi-widget-content">
                <div className="visualization-content">
                    <Measure client>
                        {({ measureRef, contentRect }) => {
                            return (
                                <div className="gd-visualization-content" ref={measureRef}>
                                    <div className="headline">
                                        {this.renderValue(contentRect.client?.height)}
                                        {this.renderPeriodOverPeriod(
                                            contentRect.client?.width,
                                            contentRect.client?.height,
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                    </Measure>
                </div>
            </div>
        );
    }
}

export default injectIntl(KpiContent);
