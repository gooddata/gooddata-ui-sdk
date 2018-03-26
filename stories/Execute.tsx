// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { AFM, Execution } from '@gooddata/typings';
import { Execute } from '../src/execution/Execute';

const afm: AFM.IAfm = {
    measures: [
        {
            localIdentifier: 'm1',
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/storybook/obj/1'
                    }
                }
            }
        },
        {
            localIdentifier: 'm2',
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/storybook/obj/2'
                    }
                }
            }
        }
    ]
};

const usage = `
    <Execute afm={afm} resultSpec={resultSpec} projectId={projectId}>
        {result => ...}
    </Execute>
`;

storiesOf('Core components/Execute', module)
    .add('Execute', () => (
        <div>
            <h4>Execute</h4>
            <p>Component which can execute AFM with ResultSpec</p>
            <h5>Usage:</h5>
            <pre>{usage}</pre>

            <h5>Example:</h5>
            <Execute
                afm={afm}
                projectId={'storybook'}
                onLoadingChanged={action('loadingChanged')}
            >
                {(result: Execution.IExecutionResponses) => (<pre>{JSON.stringify(result, null, 2)}</pre>)}
            </Execute>
        </div>
    ));
