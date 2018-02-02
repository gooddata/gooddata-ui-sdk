import { omit } from 'lodash';

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

export function createModule(xhr) {
    const getDomainSegments = (contractId, dataProductId, segmentId, query) => {
        return xhr.get(routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS,
            { contractId, dataProductId, segmentId },
            query
        ))
            .then(result => ({ items: result.domainSegments.items.map(transformDomainSegment) }));
    };

    const getDomainSegment = (contractId, dataProductId, segmentId, domainId, query) => {
        return xhr.get(routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
            { contractId, dataProductId, segmentId, domainId },
            query
        ))
            .then(result => transformDomainSegment(result));
    };

    const cloneDomainSegment = (contractId, dataProductId, segmentId, domainId, newSegmentId, newDomainId) =>
        xhr.post(
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

    const deleteDomainSegment = (contractId, dataProductId, segmentId, domainId) =>
        xhr.del(
            routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
                { contractId, dataProductId, segmentId, domainId }
            ));

    const renameDomainSegment = (contractId, dataProductId, segmentId, domainId, newSegmentId) =>
        xhr.post(
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

    const syncDomainSegment = (contractId, dataProductId, segmentId, domainId) =>
        xhr.post(routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_SYNC,
            { contractId, dataProductId, segmentId, domainId }
        ));

    const deployDomainSegment = (contractId, dataProductId, segmentId, domainId, targetDomainId, synchronize) =>
        xhr.post(
            routes.interpolate(
                routes.DEPLOY_SEGMENT,
                { contractId, dataProductId, segmentId, domainId },
                synchronize && { synchronize }
            ),
            { data: JSON.stringify({ deploySegmentRequest: { domain: targetDomainId } }) }
        );

    const updateDomainSegment = domainSegment =>
        xhr.put(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT, domainSegment), {
            data: JSON.stringify({
                domainSegment: omit(
                    domainSegment, ['contractId', 'dataProductId', 'segmentId', 'domainId']
                )
            })
        })
            .then(result => result.json())
            .then(result => transformDomainSegment(result));

    return {
        getDomainSegments,
        getDomainSegment,
        cloneDomainSegment,
        deleteDomainSegment,
        renameDomainSegment,
        syncDomainSegment,
        deployDomainSegment,
        updateDomainSegment
    };
}
