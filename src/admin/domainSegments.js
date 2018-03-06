import _ from 'lodash';

import { get, post, put, del } from '../xhr';
import * as routes from './routes';

export const transformDomainSegment = (item) => {
    const { contractId, dataProductId, segmentId, domainId } =
        routes.parse(item.domainSegment.links.self, routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT);

    return {
        contractId,
        dataProductId,
        segmentId,
        domainId,
        ...item.domainSegment
    };
};

export const getDomainSegments = (contractId, dataProductId, segmentId, query) => {
    return get(routes.interpolate(
        routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS,
        { contractId, dataProductId, segmentId },
        query
    ))
    .then(result => ({ items: result.domainSegments.items.map(transformDomainSegment) }));
};

export const getDomainSegment = (contractId, dataProductId, segmentId, domainId, query) => {
    return get(routes.interpolate(
        routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
        { contractId, dataProductId, segmentId, domainId },
        query
    ))
    .then(result => transformDomainSegment(result));
};

export const cloneDomainSegment = (contractId, dataProductId, segmentId, domainId, newSegmentId, newDomainId) =>
    post(
        routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLONE,
            { contractId, dataProductId, segmentId, domainId }
        ),
        {
            data: JSON.stringify({
                cloneSegmentRequest: {
                    clonedSegmentId: newSegmentId,
                    domain: newDomainId
                }
            })
        }
    );

export const deleteDomainSegment = (contractId, dataProductId, segmentId, domainId) =>
    del(
        routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
        { contractId, dataProductId, segmentId, domainId }
    ));

export const renameDomainSegment = (contractId, dataProductId, segmentId, domainId, newSegmentId) =>
    post(
        routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_RENAME,
            { contractId, dataProductId, segmentId, domainId }
        ),
        {
            data: JSON.stringify({
                domainSegmentRename: {
                    id: newSegmentId
                }
            })
        }
    );

export const syncDomainSegment = (contractId, dataProductId, segmentId, domainId) =>
    post(routes.interpolate(
        routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_SYNC,
        { contractId, dataProductId, segmentId, domainId }
    ));

export const deployDomainSegment = (contractId, dataProductId, segmentId, domainId, targetDomainId, synchronize) =>
    post(
        routes.interpolate(
            routes.DEPLOY_SEGMENT,
            { contractId, dataProductId, segmentId, domainId },
            synchronize && { synchronize }
        ),
        { data: JSON.stringify({ deploySegmentRequest: { domain: targetDomainId } }) }
    );

export const updateDomainSegment = domainSegment =>
    put(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT, domainSegment), {
        data: JSON.stringify({
            domainSegment: _.omit(
                    domainSegment, ['contractId', 'dataProductId', 'segmentId', 'domainId']
                )
        })
    })
    .then(result => result.json())
    .then(result => transformDomainSegment(result));
