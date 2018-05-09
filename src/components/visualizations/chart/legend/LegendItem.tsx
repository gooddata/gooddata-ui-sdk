// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import unescape = require('lodash/unescape');

import { isLineChart, isAreaChart } from '../../utils/common';

const VISIBLE_COLOR = '#6D7680';
const DISABLED_COLOR = '#CCCCCC';

export default class LegendItem extends React.Component<any, any> {
    public static defaultProps: any = {
        width: null
    };

    public render() {
        const { item, chartType, width } = this.props;

        const enableBorderRadius = isLineChart(chartType) || isAreaChart(chartType);

        const iconStyle = {
            borderRadius: enableBorderRadius ? '50%' : 'none',
            backgroundColor: item.isVisible ? item.color : DISABLED_COLOR
        };

        const nameStyle = {
            color: item.isVisible ? VISIBLE_COLOR : DISABLED_COLOR
        };

        const style = width ? { width: `${width}px` } : {};

        const onItemClick = () => {
            return this.props.onItemClick(item);
        };

        return (
            <div
                style={style}
                className="series-item"
                onClick={onItemClick}
            >
                <div className="series-icon" style={iconStyle} />
                <div
                    className="series-name"
                    style={nameStyle}
                    title={unescape(item.name)}
                >{item.name}
                </div>
            </div>
        );
    }
}
