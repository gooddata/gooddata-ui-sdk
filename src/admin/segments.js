import { get, post, del } from '../xhr';
import * as routes from './routes';
import * as domainSegments from './domainSegments';

export const transformSegment = (item) => {
    const { contractId, dataProductId } = routes.parse(item.segment.links.self, routes.CONTRACT_DATA_PRODUCT_SEGMENT);

    const segment = {
        contractId,
        dataProductId,
        ...item.segment
    };

    if (segment.domainSegments) {
        segment.domainSegments = segment.domainSegments.map(domainSegments.transformDomainSegment);
    }

    return segment;
};

export const getDataProductSegments = (contractId, dataProductId) =>
    get(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId })).then(data => ({
        items: data.segments.items.map(transformSegment),
        status: data.segments.status
    }));

export const createSegment = (contractId, dataProductId, segmentId, domainId) =>
    post(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId }), {
        data: JSON.stringify({
            segmentCreate: {
                id: segmentId,
                title: segmentId,
                domain: routes.interpolate(routes.CONTRACT_DOMAIN, { contractId, domainId })
            }
        })
    });

export const renameSegment = (contractId, dataProductId, segmentId, newSegmentId) =>
    post(
        routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENT_RENAME, { contractId, dataProductId, segmentId }),
        { data: JSON.stringify({ segmentRename: { id: newSegmentId } }) }
    );

export const deleteSegment = (contractId, dataProductId, segmentId) =>
    del(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENT, { contractId, dataProductId, segmentId }));
