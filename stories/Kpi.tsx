// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { Kpi } from '../src/components/simple/Kpi';

storiesOf('Core components/KPI', module)
    .add('KPI', () => (
        <div>
            Measure 1 with number:
            {' '}
            <Kpi
                measure={'/gdc/md/storybook/obj/1'}
                projectId={'storybook'}
                format="[<300][red]$#,#.##;[=300][yellow]$#,#.##;[>300][green]$#,#.##"
                LoadingComponent={null}
                ErrorComponent={null}
            />
            <hr/>
            Measure 9 with no data:
            {' '}
            <Kpi
                measure={'/gdc/md/storybook/obj/9'}
                projectId={'storybook'}
                format="[<300][red]$#,#.##;[=Null][backgroundcolor=DDDDDD][red]No Value"
                LoadingComponent={null}
                ErrorComponent={null}
            />
            <hr/>
            Error:
            {' '}
            <Kpi
                measure={'/gdc/md/storybook/obj/9-non-existing'}
                projectId={'storybook'}
            />

        </div>
    ));
