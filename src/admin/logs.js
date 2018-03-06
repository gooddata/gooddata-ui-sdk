import { get } from '../xhr';
import * as routes from './routes';

export const getLogs = (contractId, dataProductId, domainId, segmentId) =>
    get(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_LOG, {
        contractId,
        dataProductId,
        domainId,
        segmentId
    })).then(data => data.logs.map(item => item.log));
