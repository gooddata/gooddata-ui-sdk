import Afm from './Afm';
import { chartPropTypes } from './Chart';
import ChartConfig from './ChartConfig';
import { dataSourcePropTypes } from './DataSource';
import DrillableItem from './DrillableItem';
import Events from './Events';
import Filters from './Filters';
import { kpiPropTypes } from './Kpi';
import { metadataSourcePropTypes } from './MetadataSource';
import { tablePropTypes } from './Table';
import Transformation from './Transformation';
import { visualizationPropTypes } from './Visualization';

export default {
    Afm: Afm.afm,
    ChartConfig: ChartConfig.config,
    DrillableItem,
    Transformation: Transformation.transformation,
    Events,
    Filters: Filters.filters,
    Kpi: kpiPropTypes,
    Chart: chartPropTypes,
    DataSource: dataSourcePropTypes,
    MetadataSource: metadataSourcePropTypes,
    Table: tablePropTypes,
    Visualization: visualizationPropTypes
};
