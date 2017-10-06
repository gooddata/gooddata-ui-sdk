import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { Table } from '../src/components/afm/Table';
import { AFM_TWO_MEASURES_ONE_ATTRIBUTE, TRANSFORMATION_TWO_MEASURES } from './data/afmComponentProps';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components - Table', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                projectId="storybook"
                afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                transformation={TRANSFORMATION_TWO_MEASURES}
                onError={onErrorHandler}
            />
        </div>
    ));
