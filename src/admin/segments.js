import * as routes from './routes';
import * as domainSegments from './domainSegments';

export function createModule(xhr) {
    const transformSegment = (item) => {
        const { contractId, dataProductId } = routes.parse(
            item.segment.links.self, routes.CONTRACT_DATA_PRODUCT_SEGMENT
        );

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

    const getDataProductSegments = (contractId, dataProductId) =>
        xhr.get(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId }))
            .then(data => ({
                items: data.segments.items.map(transformSegment),
                status: data.segments.status
            }));

    const createSegment = (contractId, dataProductId, segmentId, domainIds) =>
        xhr.post(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId }), {
            data: JSON.stringify({
                segmentCreate: {
                    id: segmentId,
                    title: segmentId,
                    domains: domainIds.map(
                        domainId => routes.interpolate(routes.CONTRACT_DOMAIN, { contractId, domainId })
                    )
                }
            })
        });

    const renameSegment = (contractId, dataProductId, segmentId, newSegmentId) =>
        xhr.post(
            routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENT_RENAME, { contractId, dataProductId, segmentId }),
            { data: JSON.stringify({ segmentRename: { id: newSegmentId } }) }
        );

    const deleteSegment = (contractId, dataProductId, segmentId) =>
        xhr.del(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_SEGMENT, { contractId, dataProductId, segmentId }));

    return {
        transformSegment,
        getDataProductSegments,
        createSegment,
        renameSegment,
        deleteSegment
    };
}

