# GoodData React Components

## Installation
```
yarn add @gooddata/react-components
```

## Usage

### Kpi
KPI (Key Performance Indicator) is the most simple of the components, it renders a measure calculated by GoodData platform.

Parameters:

| Name      | Required   | Type                                                                                      | Example                                                                    |
| --------- | :--------: | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| measure   | true       | String                                                                                    | `/gdc/md/<project-id>/obj/<measure-id>`                                              |
| projectId | true       | String                                                                                    | `project-id`                                                              |
| filters   | false      | [Filter](https://github.com/gooddata/gdc-data-layer/blob/master/docs/transformation.md)[] | `[{ type: 'attribute', id: '/gdc/md/<project-id>/obj/<attr-id>', in: ['1', '2'] }]` |
| format    | false      | String                                                                                    | `$0,0.00`                                                                  |

Usage in code:
```js
import { Kpi } from '@gooddata/react-components';

<Kpi
    measure="yourMeasureUri"
    projectId="yourProjectId"
    filters={yourFilters}
    format="yourFormat"
/>
```

### BarChart, ColumnChart, LineChart, PieChart
Parameters:

| Name           | Required   | Type                                                                                                 | Example                                                                                               |
| -------------- | :--------: | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| afm            | true       | [Afm](https://github.com/gooddata/gdc-data-layer/blob/master/docs/afm.md)                            | `{ measures: [ { id: 'measure-id', definition: { baseObject: { id: '/gd/md/<project-id>/obj/<measure-id>' } } } ] }` |
| projectId      | true       | String                                                                                               | `project-id`                                                                                         |
| transformation | true       | [Transformation](https://github.com/gooddata/gdc-data-layer/blob/master/docs/transformation.md)      | `{ measures: [ { id: 'measure-id', title: 'Measure Title', format: '#,##0.00' } ] }`                   |
| config         | false      | [ChartConfig](https://github.com/gooddata/gooddata-react-components/blob/master/docs/chartConfig.md) | `{ legend: { enabled: false } }}`                                                                     |

Usage in code:
```js
import { BarChart } from '@gooddata/react-components';

<BarChart
    afm={yourAfm}
    projectId="yourProjectId"
    transformation={yourTransformation}
    config={yourChartConfig}
/>
```
Analogously for ColumnChart, LineChart and PieChart.

### Table
Parameters:

| Name           | Required   | Type                                                                                                 | Example                                                                                               |
| -------------- | :--------: | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| afm            | true       | [Afm](https://github.com/gooddata/gdc-data-layer/blob/master/docs/afm.md)                            | `{ measures: [ { id: 'measure-id', definition: { baseObject: { id: '/gd/md/<project-id>/obj/<measure-id>' } } } ] }` |
| projectId      | true       | String                                                                                               | `project-id`                                                                                         |
| transformation | false       | [Transformation](https://github.com/gooddata/gdc-data-layer/blob/master/docs/transformation.md)     | `{ measures: [ { id: 'measure-id', title: 'Measure Title', format: '#,##0.00' } ] }`                   |

Usage in code:
```js
import { Table } from '@gooddata/react-components';

<Table
    afm={yourAfm}
    projectId="yourProjectId"
    transformation={yourTransformation}
/>
```

### Visualization
This is a generic component that will render a chart according to the given URI. It can render table, or any of the charts stated above.

Parameters:

| Name           | Required   | Type                                                                                                 | Example                                                                             |
| -------------- | :--------: | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| uri            | true       | String                                                                                               | `/gdc/md/<project-id>/obj/<viz-id>`                                                       |
| config         | false      | [ChartConfig](https://github.com/gooddata/gooddata-react-components/blob/master/docs/chartConfig.md) | `{ legend: { enabled: false } }}`                                                   |

Usage in code:
```js
import { Visualization } from '@gooddata/react-components';

<Visualization
    uri="yourUri"
    config={yourChartConfig}
/>
```
