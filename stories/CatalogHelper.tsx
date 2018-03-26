// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import CatalogHelper from '../src/helpers/CatalogHelper';
import { Kpi } from '../src/components/simple/Kpi';
import '../styles/scss/charts.scss';

import * as catalogJson from './data/catalog.json';

const C = new CatalogHelper(catalogJson as any);

storiesOf('Helper components/CatalogHelper', module)
    .add('KPI', () => (
        <div>
            Usage:
            <pre>{'measure={C.measure(\'Amount [BOP]\')}'}</pre>

            Result:<br /><br />
            <Kpi
                measure={C.measure('Amount [BOP]')}
                projectId={'storybook'}
            />
        </div>
    ));
