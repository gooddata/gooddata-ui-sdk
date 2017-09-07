import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { PureFilterPublisher } from '../src/components/filters/FilterPublisher';

const DummyFilterPublishingComponent = (props) => {
    return (
        <div style={{ paddingTop: '10px' }}>
            Filter changing component<br />
            <button onClick={props.onApply}>Click me to call onApply callback</button>
        </div>
    );
};

const usage = `
    <FilterPublisher id="filter context id">
        <FilterComponent />
    </FilterPublisher>
`;

storiesOf('FilterPublisher', module)
    .add('PureFilterPublisher', () => (
        <div>
            <h4>Wrapping component for changing filters</h4>
            <p>This component binds to its direct children <i>onApply</i> function connected to redux filters.</p>
            <h5>Simple usage:</h5>
            <pre>{usage}</pre>

            <h5>Example:</h5>
            <PureFilterPublisher onApply={action('onApply called')}>
                <div>Simple HTML component (div) without props</div>
                <DummyFilterPublishingComponent />
            </PureFilterPublisher>
        </div>
    ));
