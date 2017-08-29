import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Visualization } from '../src/components/Visualization';

import '@gooddata/indigo-visualizations/lib/styles/charts.scss';
import '@gooddata/indigo-visualizations/lib/styles/table.scss';

class DynamicVisualization extends React.Component<any,any> {
    initialState: Object = {
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
        filters: [{
            id: '/gdc/md/myproject/obj/123',
            type: 'date',
            granularity: 'date',
            between: ['2017-01-01', '2017-12-31']
        }]
    };

    alternativeState: Object = {
        uri: '/gdc/md/myproject/obj/1002',
        config: {},
        filters: []
    };

    constructor(nextProps) {
        super(nextProps);
        this.state = this.initialState;
    }

    toggle(prop) {
        this.setState({
            [prop]: this.state[prop] === this.initialState[prop] ?
                this.alternativeState[prop] :
                this.initialState[prop]
        });
    }

    render() {
        return (<div>
            <div>
                <button onClick={this.toggle.bind(this, 'uri')} >uri</button>
                <button onClick={this.toggle.bind(this, 'filters')} >filter</button>
                <button onClick={this.toggle.bind(this, 'config')} >config</button>
            </div>
            <Visualization
                key="dynamic-test-vis"
                {...this.state}
            />
        </div>);
    }
}

storiesOf('Visualization', module)
    .add('table example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1001'}
                onError={console.error}
            />
        </div>
    ))
    .add('chart example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1002'}
                onError={console.error}
            />
        </div>
    ))
    .add('chart with custom colors example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
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
                onError={console.error}
            />
        </div>
    ))
    .add('chart with applied filter', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1002'}
                filters={[{
                    id: '/gdc/md/myproject/obj/123',
                    type: 'date',
                    granularity: 'date',
                    between: ['2017-01-01', '2017-12-31']
                }]}
                onError={console.error}
            />
        </div>
    ))
    .add('dynamic visualization test', () => (
        <div style={{ width: 800, height: 400 }}>
            <DynamicVisualization />
        </div>
    ));
