// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import LegendItem from './LegendItem';
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from './helpers';
import { injectIntl } from 'react-intl';

const LegendAxisIndicator = ({ axis, width, intl }: any) => {
    const style = width ? { width: `${width}px` } : {};
    return (
        <div style={style} className="series-axis-indicator">
            <div className="series-text">
                {intl.formatMessage({ id: `visualizations.legend.text.${axis}` })}
            </div>
        </div>
    );
};

export const LegendAxisIndicatorWrapped = injectIntl(LegendAxisIndicator);

export const LegendSeparator = () => (<div className="legend-separator"/>);

export default class LegendList extends React.PureComponent<any, any> {
    public render() {
        const { series, chartType, onItemClick, width }: any = this.props;
        return (
            series.map((item: any, index: number) => {
                const { type, axis } = item;
                if (type === LEGEND_AXIS_INDICATOR) {
                    return (<LegendAxisIndicatorWrapped axis={axis} key={index} width={width}/>);
                } else if (type === LEGEND_SEPARATOR) {
                    return (<LegendSeparator key={index}/>);
                } else {
                    return (
                        <LegendItem
                            chartType={chartType}
                            key={index}
                            item={item}
                            width={width}
                            onItemClick={onItemClick}
                        />
                    );
                }
            })
        );
    }
}
