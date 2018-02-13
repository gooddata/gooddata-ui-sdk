import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Kpi } from '../src/components/simple/Kpi';

storiesOf('KPI', module)
    .add('KPI', () => (
        <div>
            Measure 1 with number:
            <Kpi
                measure={'/gdc/md/storybook/obj/1'}
                projectId={'storybook'}
                format="[<300][red]$#,#.##;[=300][yellow]$#,#.##;[>300][green]$#,#.##"
            />

            <hr/>
            Measure 9 with no data:
            <Kpi
                measure={'/gdc/md/storybook/obj/9'}
                projectId={'storybook'}
                format="[<300][red]$#,#.##;[=Null][backgroundcolor=DDDDDD][red]No Value"
            />

        </div>
    ));
