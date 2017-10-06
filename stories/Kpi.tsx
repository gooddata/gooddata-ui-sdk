import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { Kpi } from '../src/components/simple/Kpi';

storiesOf('KPI', module)
    .add('KPI', () => (
        <Kpi
            measure={'/gdc/md/storybook/obj/1'}
            projectId={'storybook'}
        />
    ));
