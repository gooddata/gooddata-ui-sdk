// (C) 2019 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

export interface ILegendAxisIndicatorProps {
    labelKey: string;
    data: string[];
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
                result[index] = intl.formatMessage({ id: `visualizations.legend.text.${key}` });
                return result;
            },
            {},
        );

        return (
            <div style={style} className="series-axis-indicator">
                <div className="series-text">
                    {intl.formatMessage({ id: `visualizations.legend.text.${labelKey}` }, values)}
                    {intl.formatMessage({ id: "visualizations.legend.text.colon" })}
                </div>
            </div>
        );
    }
}

export const LegendAxisIndicator = injectIntl(LegendAxisIndicatorClass);
