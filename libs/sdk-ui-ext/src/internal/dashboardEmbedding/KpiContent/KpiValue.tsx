// (C) 2007-2020 GoodData Corporation
import React, { PureComponent } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import cx from "classnames";
import { ResponsiveText, LoadingDots } from "@gooddata/sdk-ui-kit";
import { ISeparators } from "@gooddata/sdk-ui";

import { HYPHEN, formatMetric, isValueUnhandledNull } from "./utils/format";

const NO_DATA_PLACEHOLDER = HYPHEN;

export interface IKpiValueProps {
    error?: Error | null;
    errorHelp?: string;
    separators?: ISeparators;
    value: string | number | undefined;
    format?: string;
    isLoading?: boolean;
    disableKpiDrillUnderline?: boolean;
}

class KpiValue extends PureComponent<IKpiValueProps & WrappedComponentProps> {
    static defaultProps: Partial<IKpiValueProps & WrappedComponentProps> = {
        error: null,
        value: "",
        isLoading: false,
        disableKpiDrillUnderline: false,
    };

    render() {
        return (
            <TransitionGroup
                className={cx("kpi-value", {
                    "is-error-value": !this.props.isLoading && !!this.props.error,
                    "is-empty-value": !this.props.isLoading && this.isValueUnhandledNull(),
                })}
            >
                <CSSTransition classNames="kpi-animation" timeout={300} title={this.getTitle()}>
                    {this.renderValue()}
                </CSSTransition>
            </TransitionGroup>
        );
    }

    renderValue() {
        if (this.props.isLoading) {
            return <LoadingDots className={"kpi-value-loading gd-loading-dots-centered"} />;
        }

        const value = this.props.error ? this.formatMessage("error") : this.renderFormattedValue();
        const valueClassNames = cx("kpi-value-value", "s-kpi-value", {
            "kpi-link-style-underline": !this.props.disableKpiDrillUnderline,
        });

        return (
            <ResponsiveText>
                <span className={valueClassNames}>{value}</span>
            </ResponsiveText>
        );
    }

    renderFormattedValue() {
        if (this.isValueUnhandledNull()) {
            return NO_DATA_PLACEHOLDER;
        }

        return formatMetric(this.props.value, this.props.format, this.props.separators);
    }

    isValueUnhandledNull() {
        return isValueUnhandledNull(this.props.value, this.props.format);
    }

    getTitle() {
        if (this.props.isLoading) {
            return "";
        }

        if (this.props.error && this.props.errorHelp) {
            return this.props.errorHelp;
        }

        if (this.isValueUnhandledNull()) {
            return this.formatMessage("kpi.noData");
        }

        return "";
    }

    formatMessage(id: string) {
        return this.props.intl.formatMessage({ id });
    }
}

export default injectIntl(KpiValue);
