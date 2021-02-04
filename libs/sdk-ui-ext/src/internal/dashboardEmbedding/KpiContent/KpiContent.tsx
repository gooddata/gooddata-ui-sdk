// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { GoodDataSdkError, isGoodDataSdkError, ErrorCodes, ISeparators } from "@gooddata/sdk-ui";
import { isLegacyKpiWithComparison, IKpiWidget, IKpiWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { IFilter, isAbsoluteDateFilter, isAllTimeDateFilter, isDateFilter } from "@gooddata/sdk-model";

import KpiValue from "./KpiValue";
import KpiPop from "./KpiPop";
import { IKpiResult } from "../types";
import { isDateFilterIrrelevant } from "../utils/filters";
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
    clientWidth: number;

    // Callbacks
    isKpiUnderlineHiddenWhenClickable?: boolean;
    isKpiValueClickDisabled?: boolean;
    onKpiValueClick?: () => void;
}

class KpiContent extends Component<IKpiContentProps & WrappedComponentProps> {
    static defaultProps: Partial<IKpiContentProps & WrappedComponentProps> = {
        isKpiValueClickDisabled: false,
        filters: [],
        isKpiUnderlineHiddenWhenClickable: false,
    };

    renderPeriodOverPeriod() {
        if (this.props.kpi.kpi.comparisonType === "none") {
            return false;
        }

        const { kpiResult } = this.props;
        const isDateFilterNotRelevant = isDateFilterIrrelevant(this.props.kpi);
        const isDateFilterAbsolute = this.props.filters.some(isAbsoluteDateFilter);
        const isDateFilterAllTime = this.props.filters.every(
            (f) => !isDateFilter(f) || isAllTimeDateFilter(f),
        );

        const dateFilter = this.props.filters.find(isDateFilter); // for now we use the first date filter available for this
        const popLabel = getKpiPopLabel(dateFilter, this.props.kpi.kpi.comparisonType, this.props.intl);
        const popDisabled = isDateFilterAllTime || isDateFilterNotRelevant || isDateFilterAbsolute;
        const isSdkError = isGoodDataSdkError(this.props.error);
        const isNoData = isSdkError && this.props.error.message === ErrorCodes.NO_DATA;

        const comparisonMeaning = isLegacyKpiWithComparison(this.props.kpi.kpi)
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
                kpiWidth={this.props.clientWidth}
            />
        );
    }

    renderValue() {
        const { kpiResult, isKpiValueClickDisabled, onKpiValueClick } = this.props;
        const isSdkError = isGoodDataSdkError(this.props.error);
        const isNoData = isSdkError && this.props.error.message === ErrorCodes.NO_DATA;

        const kpiValue = (
            <KpiValue
                isLoading={this.props.isLoading}
                error={!isNoData ? this.props.error : undefined}
                errorHelp={this.props.errorHelp}
                value={kpiResult?.measureResult ?? null} // null === empty result
                format={kpiResult?.measureFormat}
                separators={this.props.separators}
                disableKpiDrillUnderline={this.props.isKpiUnderlineHiddenWhenClickable}
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

    render(): React.ReactNode {
        return (
            <>
                {this.renderValue()}
                {this.renderPeriodOverPeriod()}
            </>
        );
    }
}

export default injectIntl(KpiContent);
