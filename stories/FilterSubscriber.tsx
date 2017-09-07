import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Afm } from '@gooddata/data-layer';
import { PureFilterSubscriber } from '../src/components/filters/FilterSubscriber';

const DummyFilterSubscribingComponent = (props) => {
    return <div>Passed filters: <pre>{JSON.stringify(props.filters)}</pre></div>;
};

const filters: Afm.IFilter[] = [
    {
        id: 'identifier',
        type: 'attribute',
        in: [
            '1', '2'
        ]
    },
    {
        id: 'identifier2',
        type: 'attribute',
        in: [
            '3', '4'
        ]
    }
];

const usage = `
    <FilterSubscriber ids={['filter context id1', 'filter context id2']}>
        <Visualization />
    </FilterSubscriber>
`;

storiesOf('FilterSubscriber', module)
    .add('PureFilterSubscriber', () => (
        <div>
            <h4>Wrapping component for subscribing filters</h4>
            <p>This component binds to its direct children <i>filters</i> property connected to redux filters.</p>
            <h5>Simple usage:</h5>
            <pre>{usage}</pre>

            <h5>Example:</h5>
            <PureFilterSubscriber filters={filters}>
                <DummyFilterSubscribingComponent />
                <div>Base HTML component without props</div>
            </PureFilterSubscriber>
        </div>
    ));
