// (C) 2007-2022 GoodData Corporation
import React, { PureComponent } from "react";
import cx from "classnames";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { ResponsiveText } from "@gooddata/sdk-ui-kit";
import { ISeparators } from "@gooddata/sdk-ui";

import { formatMetric, HYPHEN, isValueUnhandledNull } from "./utils/format.js";
import { getErrorPopInfo, getPopInfo, IPopInfo } from "./utils/pop.js";
import {
    HeadlinePagination,
    shouldRenderPagination,
    getHeadlineResponsiveClassName,
} from "@gooddata/sdk-ui-vis-commons";

const LOADING_PLACEHOLDER = "…";
const NO_DATA_PLACEHOLDER = HYPHEN;

export interface IKpiPopProps {
    currentPeriodValue: number | null;
    previousPeriodValue: number | null;
    error?: Error | null;
    format?: string;
    meaning?: string;
    disabled?: boolean;
    isLoading?: boolean;
    previousPeriodName?: string;
    separators?: ISeparators;
    enableCompactSize?: boolean;
    clientWidth?: number;
    clientHeight?: number;
}

class KpiPop extends PureComponent<IKpiPopProps & WrappedComponentProps> {
    static defaultProps: Pick<
        IKpiPopProps,
        | "error"
        | "disabled"
        | "isLoading"
        | "previousPeriodName"
        | "clientWidth"
        | "clientHeight"
        | "enableCompactSize"
    > = {
        error: null,
        disabled: false,
        isLoading: false,
        previousPeriodName: "",
        clientWidth: 0,
        clientHeight: 0,
        enableCompactSize: false,
    };

    kpiSectionItemNode = React.createRef<HTMLElement>();

    render() {
        const { enableCompactSize, clientHeight, clientWidth } = this.props;

        const pagination = shouldRenderPagination(enableCompactSize!, clientWidth!, clientHeight!);

        if (pagination) {
            return (
                <div className="gd-flex-container headline-compare-section headline-paginated-compare-section">
                    <HeadlinePagination
                        renderSecondaryItem={this.renderPreviousPeriod}
                        renderTertiaryItem={this.renderPercentage}
                    />
                </div>
            );
        }

        return (
            <div className={this.getKpiSectionClassName()}>
                {this.renderPercentage()}
                {this.renderPreviousPeriod()}
            </div>
        );
    }

    renderPercentage = () => {
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
            <dl className="gd-flex-item kpi-pop-section-item kpi-pop-change headline-compare-section-item headline-tertiary-item">
                <div className="headline-value-wrapper s-headline-value-wrapper">
                    <ResponsiveText title={tooltip} tagClassName={`is-kpi-${popInfo.meaning}`} tagName="dt">
                        {this.renderPercentageValue(popInfo)}
                    </ResponsiveText>
                </div>
                <dd>
                    <FormattedMessage id="kpiPop.change" />
                </dd>
            </dl>
        );
    };

    renderPercentageValue(popInfo: IPopInfo) {
        return this.props.isLoading ? (
            false
        ) : (
            <>
                <span className={cx(`gd-icon-trend-${popInfo.trend}`, "gd-kpi-trend-icon")} />
                <span>{popInfo.percentage}</span>
            </>
        );
    }

    renderPreviousPeriod = () => {
        return (
            <dl
                className="gd-flex-item kpi-pop-section-item kpi-pop-period headline-compare-section-item headline-secondary-item"
                title={this.renderFormattedValue()}
            >
                <ResponsiveText tagName="dt">{this.renderPreviousPeriodValue()}</ResponsiveText>
                {this.renderPreviousPeriodName()}
            </dl>
        );
    };

    renderPreviousPeriodName() {
        return this.props.previousPeriodName ? (
            <dd
                className="headline-title-wrapper"
                ref={this.kpiSectionItemNode}
                title={this.props.previousPeriodName}
            >
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

        if (this.props.disabled || isValueUnhandledNull(value, this.props.format ?? "")) {
            return NO_DATA_PLACEHOLDER;
        }

        return formatMetric(value, this.props.format, this.props.separators);
    }

    getKpiSectionClassName() {
        const { clientWidth } = this.props;
        const kpiSectionItemNode = this.kpiSectionItemNode.current;
        const className = "gd-flex-container headline-compare-section";
        const responsiveClassName = getHeadlineResponsiveClassName(clientWidth);

        if (kpiSectionItemNode && responsiveClassName) {
            return `${className} ${responsiveClassName}`;
        }

        return className;
    }

    formatMessage(id: string) {
        return this.props.intl.formatMessage({ id });
    }
}

export default injectIntl(KpiPop);
