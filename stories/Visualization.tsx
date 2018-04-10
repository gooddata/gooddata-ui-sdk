// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { AFM } from '@gooddata/typings';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Visualization, IVisualizationProps } from '../src/components/uri/Visualization';
import { CUSTOM_COLORS } from './data/colors';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';
import '../styles/scss/table.scss';

const defaultFilter: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: {
            uri: '/gdc/md/myproject/obj/123'
        },
        from: '2017-01-01',
        to: '2017-12-31'
    }
};

class DynamicVisualization extends React.Component<any, any> {
    private initialProps: IVisualizationProps = {
        projectId: 'myproject',
        uri: '/gdc/md/myproject/obj/1001',
        config: { colors: CUSTOM_COLORS },
        filters: [defaultFilter]
    };

    private alternativeProps: IVisualizationProps = {
        projectId: 'myproject',
        uri: '/gdc/md/myproject/obj/1002',
        config: {},
        filters: []
    };

    constructor(nextProps: IVisualizationProps) {
        super(nextProps);
        this.state = this.initialProps;
    }

    public render() {
        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div>
                    <button onClick={this.toggle.bind(this, 'uri')}>toggle uri</button>
                    <button onClick={this.toggle.bind(this, 'filters')}>toggle filter</button>
                    <button onClick={this.toggle.bind(this, 'config')}>toggle config</button>
                </div>
                <Visualization
                    key="dynamic-test-vis"
                    onLoadingChanged={this.onLoadingChanged}
                    onError={onErrorHandler}
                    projectId={this.state.projectId}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    {...this.state}
                />
                {this.state.isLoading
                    ? <div
                        className="gd-spinner large"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            margin: '-16px 0 0 -16px'
                        }}
                    />
                    : null}
            </div>
        );
    }

    private toggle(prop: string) {
        this.setState({
            [prop]: this.state[prop] === this.initialProps[prop]
                ? this.alternativeProps[prop]
                : this.initialProps[prop]
        });
    }

    private onLoadingChanged = ({ isLoading }: { isLoading: boolean }) => {
        this.setState({ isLoading });
    }
}

storiesOf('URI components/Visualization', module)
    .add('table example', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1001'}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('table example with identifier', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    identifier="1001"
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('table with eventing', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1001'}
                    drillableItems={[{ identifier: '1' }, { identifier: '3' }]}
                    onFiredDrillEvent={action('drill-event fired')}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('table resizable', () => (
        screenshotWrap(
            <div
                style={{
                    width: 800,
                    height: 400,
                    padding: 10,
                    border: 'solid 1px #000000',
                    resize: 'both',
                    overflow: 'auto'
                }}
            >
                <Visualization
                    projectId="myproject"
                    identifier="1001"
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('chart with PoP measure', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1003'}
                    onError={onErrorHandler}
                    locale="de-DE"
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('chart example', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1002'}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('chart example with custom legend', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1002'}
                    config={{
                        legend: {
                            enabled: false
                        }
                    }}
                    onLegendReady={action('onLegendReady')} // NOTE: onClick is not shown in action logger
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('chart with applied filter and custom colors', () => {
        const filter: AFM.IAbsoluteDateFilter = {
            absoluteDateFilter: {
                dataSet: {
                    uri: '/gdc/md/myproject/obj/123'
                },
                from: '2017-01-01',
                to: '2017-12-31'
            }
        };

        return screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1002'}
                    filters={[filter]}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        );
    })
    .add('chart with eventing', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1002'}
                    drillableItems={[{ identifier: '1' }, { identifier: '2' }]}
                    onFiredDrillEvent={action('drill-event fired')}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('Headline', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1004'}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('dynamic visualization test', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <DynamicVisualization />
            </div>
        )
    ))
    .add('error', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                projectId="myproject"
                uri={'/gdc/md/myproject/obj/1005'}
                onError={onErrorHandler}
                LoadingComponent={null}
            />
        </div>
    ));
