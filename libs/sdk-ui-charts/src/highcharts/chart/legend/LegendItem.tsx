// (C) 2007-2018 GoodData Corporation
import React from "react";
import unescape from "lodash/unescape";

import { isLineChart, isAreaChart, isComboChart } from "../../utils/common";

const VISIBLE_COLOR = "#6D7680";
const DISABLED_COLOR = "#CCCCCC";

export default class LegendItem extends React.Component<any, any> {
    public static defaultProps: any = {
        width: null,
    };

    public render(): React.ReactNode {
        const { item, chartType, width } = this.props;
        const itemChartType = isComboChart(chartType) ? item.type : chartType;
        const enableBorderRadius = isLineChart(itemChartType) || isAreaChart(itemChartType);

        const iconStyle = {
            borderRadius: enableBorderRadius ? "50%" : "0",
            backgroundColor: item.isVisible ? item.color : DISABLED_COLOR,
        };

        const nameStyle = {
            color: item.isVisible ? VISIBLE_COLOR : DISABLED_COLOR,
        };

        const style = width ? { width: `${width}px` } : {};

        const onItemClick = () => {
            return this.props.onItemClick(item);
        };

        return (
            <div style={style} className="series-item" onClick={onItemClick}>
                <div className="series-icon" style={iconStyle} />
                <div className="series-name" style={nameStyle} title={unescape(item.name)}>
                    {item.name}
                </div>
            </div>
        );
    }
}
