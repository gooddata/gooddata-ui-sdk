// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as cx from 'classnames';

import LegendItem from './LegendItem';
import { calculateFluidLegend } from './helpers';

export default class FluidLegend extends React.PureComponent<any, any> {
    public static defaultProps: any = {
        containerWidth: null
    };

    constructor(props: any) {
        super(props);

        this.state = {
            showAll: false
        };

        this.toggleShowAll = this.toggleShowAll.bind(this);
    }

    public toggleShowAll() {
        this.setState({
            showAll: !this.state.showAll
        });
    }

    public renderSeries(itemWidth: any, visibleItemsCount: any) {
        const { series, chartType, onItemClick } = this.props;

        const limit = this.state.showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <div className="series">
                {pagedSeries.map((item: any, index: number) => {
                    return (
                        <LegendItem
                            width={itemWidth}
                            chartType={chartType}
                            key={index}
                            item={item}
                            onItemClick={onItemClick}
                        />
                    );
                })}
            </div>
        );
    }

    public renderPaging() {
        const classes = cx('button-link',
            'button-icon-only',
            'paging-button', {
                'icon-chevron-up': this.state.showAll,
                'icon-chevron-down': !this.state.showAll
            }
        );
        return (
            <div className="paging">
                <button className={classes} onClick={this.toggleShowAll} />
            </div>
        );
    }

    public render() {
        const { series, containerWidth } = this.props;
        const { itemWidth, hasPaging, visibleItemsCount } =
            calculateFluidLegend(series.length, containerWidth);
        return (
            <div className="viz-legend fluid">
                {this.renderSeries(itemWidth, visibleItemsCount)}
                {hasPaging && this.renderPaging()}
            </div>
        );
    }
}
