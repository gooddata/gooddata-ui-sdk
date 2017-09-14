import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { ISimpleExecutorResult } from 'gooddata';
import { Afm } from '@gooddata/data-layer';
import { Execute } from '../src/execution/Execute';

const afm: Afm.IAfm = {
    measures: [{
        id: 'm1',
        definition: {
            baseObject: {
                id: '/gdc/md/storybook/obj/1'
            }
        }
    }, {
        id: 'm2',
        definition: {
            baseObject: {
                id: '/gdc/md/storybook/obj/2'
            }
        }
    }]
};

const usage = `
    <Execute afm={afm} transformation={transformation} projectId={projectId}>
        {result => ...}
    </Execute>
`;

storiesOf('Execute', module)
    .add('Execute', () => (
        <div>
            <h4>Execute</h4>
            <p>Component which can execute AFM with Transformation</p>
            <h5>Usage:</h5>
            <pre>{usage}</pre>

            <h5>Example:</h5>
            <Execute
                afm={afm}
                projectId={'storybook'}
                onLoadingChanged={action('loadingChanged')}
            >
                {(result: ISimpleExecutorResult) => (<pre>{JSON.stringify(result)}</pre>)}
            </Execute>
        </div>
    ));
