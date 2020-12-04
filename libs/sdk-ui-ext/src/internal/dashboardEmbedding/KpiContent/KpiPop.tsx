// (C) 2007-2020 GoodData Corporation
import React, { PureComponent } from "react";
import cx from "classnames";
import { FormattedHTMLMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import { ISeparators } from "@gooddata/sdk-ui";

import { formatMetric, HYPHEN, isValueUnhandledNull } from "./utils/format";
import { getErrorPopInfo, getPopInfo, IPopInfo } from "./utils/pop";
import { getResponsiveClassName } from "../DashboardLayout/utils/legacy";

const LOADING_PLACEHOLDER = "…";
const NO_DATA_PLACEHOLDER = HYPHEN;

export interface IKpiPopProps {
    currentPeriodValue: number | null;
    previousPeriodValue: number | null;
    error?: Error | null;
    format: string;
    meaning: string;
    disabled?: boolean;
    isLoading?: boolean;
    previousPeriodName?: string;
    separators: ISeparators;
    kpiWidth: number;
}

class KpiPop extends PureComponent<IKpiPopProps & WrappedComponentProps> {
    static defaultProps: Partial<IKpiPopProps & WrappedComponentProps> = {
        error: null,
        disabled: false,
        isLoading: false,
        previousPeriodName: "",
        kpiWidth: 0,
    };

    kpiSectionItemNode = React.createRef<HTMLElement>();

    render() {
        return (
            <div className={this.getKpiSectionClassName()}>
                {this.renderPercentage()}
                {this.renderPreviousPeriod()}
            </div>
        );
    }

    renderPercentage() {
        const popInfo =
            this.props.disabled || !!this.props.error
                ? getErrorPopInfo()
                : getPopInfo(
                      this.props.previousPeriodValue,
                      this.props.currentPeriodValue,
                      this.props.meaning,
                  );
        const tooltip = this.props.isLoading ? "" : popInfo.percentage;

        return (
            <dl className="gd-flex-item kpi-pop-section-item kpi-pop-change">
                <ResponsiveText title={tooltip} tagClassName={`is-kpi-${popInfo.meaning}`} tagName="dt">
                    {this.renderPercentageValue(popInfo)}
                </ResponsiveText>
                <dd>
                    <FormattedHTMLMessage id="kpiPop.change" />
                </dd>
            </dl>
        );
    }

    renderPercentageValue(popInfo: IPopInfo) {
        return this.props.isLoading ? (
            false
        ) : (
            <>
                <span className={cx(`icon-trend-${popInfo.trend}`, "kpi-trend-icon")} />
                {popInfo.percentage}
            </>
        );
    }

    renderPreviousPeriod() {
        return (
            <dl
                className="gd-flex-item kpi-pop-section-item kpi-pop-period"
                title={this.renderFormattedValue()}
            >
                <ResponsiveText tagName="dt">{this.renderPreviousPeriodValue()}</ResponsiveText>
                {this.renderPreviousPeriodName()}
            </dl>
        );
    }

    renderPreviousPeriodName() {
        return this.props.previousPeriodName ? (
            <dd ref={this.kpiSectionItemNode} title={this.props.previousPeriodName}>
                {this.props.previousPeriodName}
            </dd>
        ) : (
            false
        );
    }

    renderPreviousPeriodValue() {
        if (this.props.isLoading) {
            return LOADING_PLACEHOLDER;
        }

        return this.props.error ? this.formatMessage("error") : this.renderFormattedValue();
    }

    renderFormattedValue() {
        const value = this.props.previousPeriodValue;

        if (this.props.disabled || isValueUnhandledNull(value, this.props.format)) {
            return NO_DATA_PLACEHOLDER;
        }

        return formatMetric(value, this.props.format, this.props.separators);
    }

    getKpiSectionClassName() {
        const { kpiWidth } = this.props;
        const kpiSectionItemNode = this.kpiSectionItemNode.current;
        const className = "gd-flex-container kpi-pop-section";

        if (kpiSectionItemNode && getResponsiveClassName(kpiWidth)) {
            return `${className} kpi-pop-section-${getResponsiveClassName(kpiWidth)}`;
        }

        return className;
    }

    formatMessage(id: string) {
        return this.props.intl.formatMessage({ id });
    }
}

export default injectIntl(KpiPop);
