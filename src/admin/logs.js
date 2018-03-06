import * as routes from './routes';

export function createModule(xhr) {
    const getLogs = (contractId, dataProductId, domainId, segmentId) =>
        xhr.get(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_LOG, {
            contractId,
            dataProductId,
            domainId,
            segmentId
        })).then(data => data.logs.map(item => item.log));

    return {
        getLogs
    };
}
