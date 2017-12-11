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
            <div>
                <div>
                    <button onClick={this.toggle.bind(this, 'uri')}>toggle uri</button>
                    <button onClick={this.toggle.bind(this, 'filters')}>toggle filter</button>
                    <button onClick={this.toggle.bind(this, 'config')}>toggle config</button>
                </div>
                <Visualization
                    key="dynamic-test-vis"
                    onLoadingChanged={this.onLoadingChanged}
                    onError={onErrorHandler}
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

storiesOf('Visualization', module)
    .add('table example', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1001'}
                    onError={onErrorHandler}
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
                    drillableItems={[{ uri: 'm1' }, { uri: 'm2' }]}
                    onFiredDrillEvent={action('drill-event fired')}
                    onError={onErrorHandler}
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
                />
            </div>
        )
    ))
    .add('chart with custom colors example', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <Visualization
                    projectId="myproject"
                    uri={'/gdc/md/myproject/obj/1002'}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('chart with applied filter', () => {
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
                    onError={onErrorHandler}
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
                    drillableItems={[{ uri: 'm1' }, { uri: 'm2' }]}
                    onFiredDrillEvent={action('drill-event fired')}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('dynamic visualization test', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400, position: 'relative' }}>
                <DynamicVisualization />
            </div>
        )
    ));
