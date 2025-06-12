// (C) 2019-2025 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { messages } from "../locales.js";

export interface ILegendAxisIndicatorProps {
    labelKey?: string;
    data?: string[];
    width?: number;
}

export class LegendAxisIndicatorClass extends React.PureComponent<
    ILegendAxisIndicatorProps & WrappedComponentProps
> {
    public render() {
        const { labelKey, width, data, intl } = this.props;
        const style = width ? { width: `${width}px` } : {};
        const values = (data || []).reduce(
            (result: { [index: number]: string }, key: string, index: number) => {
                result[index] = intl.formatMessage(messages[key as keyof typeof messages]);
                return result;
            },
            {},
        );

        return (
            <div
                style={style}
                className="series-axis-indicator"
                aria-label="Legend axis indicator"
                data-testid={"legend-axis-indicator"}
            >
                <div className="series-text">
                    {intl.formatMessage(messages[labelKey as keyof typeof messages], values)}
                    {intl.formatMessage(messages["colon"])}
                </div>
            </div>
        );
    }
}

export const LegendAxisIndicator = injectIntl(LegendAxisIndicatorClass);
