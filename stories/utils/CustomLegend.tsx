// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { screenshotWrap } from '@gooddata/test-storybook';
import identity = require('lodash/identity');

import ChartTransformation from '../../src/components/visualizations/chart/ChartTransformation';
import { barChartWith3MetricsAndViewByAttribute } from '../test_data/fixtures';
import { wrap } from './wrap';

export default class CustomLegend extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            legendItems: null
        };
    }

    public renderTriangle(color: any) {
        const style = {
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderLeft: `20px solid ${color}`,
            borderBottom: '10px solid transparent',
            marginRight: '5px'
        };
        return (
            <div style={style} />
        );
    }

    public renderLegend() {
        const { legendItems } = this.state;
        return (
            <div className="custom-legend">
                {legendItems.map((item: any, i: number) => {
                    const { color } = item;
                    return (
                        <div
                            key={i} // eslint-disable-line react/no-array-index-key
                            onClick={item.onClick}
                            style={{ display: 'flex', padding: '5px 0', cursor: 'pointer' }}
                        >
                            {this.renderTriangle(color)}
                            <span style={{ color }}>{item.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    public render() {
        const dataSet = barChartWith3MetricsAndViewByAttribute;
        const setData = (data: any) => {
            this.setState(data);
        };
        return screenshotWrap(
            <div>
                {this.state.legendItems && this.renderLegend()}
                {wrap(
                    <ChartTransformation
                        config={{
                            type: 'column',
                            legend: {
                                enabled: false
                            }
                        }}
                        {...dataSet}
                        onDataTooLarge={identity}
                        onLegendReady={setData}
                    />
                )}
            </div>
        );
    }
}
