import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';
import { dataSourcePropTypes } from './DataSource';
import { metadataSourcePropTypes } from './MetadataSource';

export const chartPropTypes = {
    ...chartConfig,
    ...events,
    dataSource: dataSourcePropTypes,
    metadataSource: metadataSourcePropTypes,
    locale: PropTypes.string,
    height: PropTypes.number,
    drillableItems: PropTypes.bool,
    environment: PropTypes.string
};
