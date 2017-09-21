import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Afm } from '@gooddata/data-layer';

import { Visualization, IVisualizationProps } from '../src/components/uri/Visualization';

import '../styles/scss/charts.scss';
import '../styles/scss/table.scss';
import { onErrorHandler } from './mocks';

const defaultFilter: Afm.IFilter = {
    id: '/gdc/md/myproject/obj/123',
    type: 'date',
    intervalType: 'absolute',
    granularity: 'date',
    between: ['2017-01-01', '2017-12-31']
};

class DynamicVisualization extends React.Component<any, any> {
    initialProps: IVisualizationProps = {
        projectId: 'myproject',
        uri: '/gdc/md/myproject/obj/1001',
        config: {
            colors: [
                'rgba(195, 49, 73, 1)',
                'rgba(168, 194, 86, 1)',
                'rgba(243, 217, 177, 1)',
                'rgba(194, 153, 121, 1)',
                'rgba(162, 37, 34, 1)'
            ]
        },
        filters: [defaultFilter]
    };

    alternativeProps: IVisualizationProps = {
        projectId: 'myproject',
        uri: '/gdc/md/myproject/obj/1002',
        config: {},
        filters: []
    };

    onLoadingChanged = ({ isLoading }) => {
        this.setState({ isLoading });
    }

    constructor(nextProps) {
        super(nextProps);
        this.state = this.initialProps;
    }

    toggle(prop) {
        this.setState({
            [prop]: this.state[prop] === this.initialProps[prop] ?
            this.alternativeProps[prop] :
            this.initialProps[prop]
        });
    }

    render() {
        return (
            <div>
                <div>
                    <button onClick={this.toggle.bind(this, 'uri')} >toggle uri</button>
                    <button onClick={this.toggle.bind(this, 'filters')} >toggle filter</button>
                    <button onClick={this.toggle.bind(this, 'config')} >toggle config</button>
                </div>
                <Visualization
                    key="dynamic-test-vis"
                    onLoadingChanged={this.onLoadingChanged}
                    onError={onErrorHandler}
                    {...this.state}
                />
                { this.state.isLoading ? <div className="gd-spinner large" style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    margin: '-16px 0 0 -16px'
                }} ></div> : null }
            </div>
        );
    }
}

storiesOf('Visualization', module)
    .add('table example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                projectId="myproject"
                uri={'/gdc/md/myproject/obj/1001'}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('table example with identifier', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                projectId="myproject"
                identifier="1001"
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('chart example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                projectId="myproject"
                uri={'/gdc/md/myproject/obj/1002'}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('chart with custom colors example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                projectId="myproject"
                uri={'/gdc/md/myproject/obj/1002'}
                config={{
                    colors: [
                        'rgba(195, 49, 73, 1)',
                        'rgba(168, 194, 86, 1)',
                        'rgba(243, 217, 177, 1)',
                        'rgba(194, 153, 121, 1)',
                        'rgba(162, 37, 34, 1)'
                    ]
                }}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('chart with applied filter', () => {
        const filter: Afm.IFilter = {
            id: '/gdc/md/myproject/obj/123',
            type: 'date',
            intervalType: 'absolute',
            granularity: 'date',
            between: ['2017-01-01', '2017-12-31']
        };
        return (
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
    .add('dynamic visualization test', () => (
        <div style={{ width: 800, height: 400, position: 'relative' }}>
            <DynamicVisualization />
        </div>
    ));
