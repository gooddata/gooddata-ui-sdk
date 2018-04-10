// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import throttle = require('lodash/throttle');
import * as Measure from 'react-measure';
import * as cx from 'classnames';

import FluidLegend from './FluidLegend';
import StaticLegend from './StaticLegend';

export const FLUID_LEGEND_THRESHOLD = 768;

export default class Legend extends React.PureComponent<any, any> {
    public static defaultProps = {
        responsive: false,
        documentObj: document,
        legendItemsEnabled: [] as any,
        height: 0
    };

    private throttledOnWindowResize: any;

    constructor(props: any) {
        super(props);

        this.state = {
            showFluid: this.shouldShowFluid()
        };

        this.onItemClick = this.onItemClick.bind(this);
        this.throttledOnWindowResize = throttle(this.onWindowResize.bind(this), 100);
    }

    public componentDidMount() {
        window.addEventListener('resize', this.throttledOnWindowResize);
    }

    public componentWillUnmount() {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener('resize', this.throttledOnWindowResize);
    }

    public onWindowResize() {
        this.setState({
            showFluid: this.shouldShowFluid()
        });
    }

    public onItemClick(item: any) {
        this.props.onItemClick(item);
    }

    public getSeries() {
        const { series, legendItemsEnabled } = this.props;

        const seriesWithVisibility = series.map((seriesItem: any) => {
            const isVisible = legendItemsEnabled[seriesItem.legendIndex];
            return {
                ...seriesItem,
                isVisible
            };
        });
        return seriesWithVisibility;
    }

    public shouldShowFluid() {
        const { documentObj } = this.props;
        return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
    }

    public renderFluid() {
        const { chartType } = this.props;

        return (
            <Measure>
                {({ width }: any) => (
                    <div className="viz-fluid-legend-wrap">
                        <FluidLegend
                            series={this.getSeries()}
                            chartType={chartType}
                            onItemClick={this.onItemClick}
                            containerWidth={width}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    public renderStatic() {
        const { chartType, position, height } = this.props;

        const classNames = cx('viz-static-legend-wrap', `position-${position}`);

        const props = {
            series: this.getSeries(),
            chartType,
            onItemClick: this.onItemClick,
            position
        };

        return (
            <Measure>
                {(dimensions: any) => (
                    <div className={classNames}>
                        <StaticLegend
                            {...props}
                            containerHeight={height || dimensions.height}
                        />
                    </div>
                )}
            </Measure>
        );
    }

    public render() {
        const { responsive } = this.props;
        const { showFluid } = this.state;

        const fluidLegend = responsive && showFluid;

        if (fluidLegend) {
            return this.renderFluid();
        }

        return this.renderStatic();
    }
}
