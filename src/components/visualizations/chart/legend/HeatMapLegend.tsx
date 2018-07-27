// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import get = require('lodash/get');
import head = require('lodash/head');
import last = require('lodash/last');
import range = require('lodash/range');
import * as classNames from 'classnames';
import { formatLegendLabel } from '../../utils/common';

export interface IHeatMapLegendProps {
    series: any;
    format?: string;
    numericSymbols: string[];
}

export default class HeatMapLegend extends React.PureComponent<IHeatMapLegendProps> {
    public render() {
        const { series, format, numericSymbols } = this.props;
        const min = get(head(series), 'range.from', 0);
        const max = get(last(series), 'range.to', 0);
        const diff =  max - min;

        return (
            <div className="heatmap-legend">
                <div className="legend-labels">
                {
                    range(series.length + 1).map((index) => {
                        let value;
                        let align;

                        if (index === 0) {
                            value = formatLegendLabel(get(series, '0.range.from', 0), format, diff, numericSymbols);
                            align = 'left';
                        } else if (index === series.length) {
                            value = formatLegendLabel(
                                get(series, `${index - 1}.range.to`, 0),
                                format,
                                diff,
                                numericSymbols
                            );
                            align = 'right';
                        } else {
                            value = formatLegendLabel(
                                get(series, `${index}.range.from`, 0),
                                format,
                                diff,
                                numericSymbols
                            );
                            align = 'center';
                        }

                        const classes = classNames('label', align);
                        return (
                            <span
                                className={classes}
                                key={`label-${index}`}
                            >
                                {value}
                            </span>
                        );
                    })
                }
                </div>
                <div className="legend-boxes">
                    {series.map((item: any, index: number) => {
                        const style = this.getBoxStyle(item);

                        return (
                            <span className="box" key={`item-${index}`} style={style} />
                        );
                    })}
                </div>
            </div>
        );
    }

    private getBoxStyle(item: any) {
        return {
            backgroundColor: item.color,
            border: item.color === 'rgb(255,255,255)' ? '1px solid #ccc' : 'none'
        };
    }
}

// export default injectIntl(HeatMapLegend);
