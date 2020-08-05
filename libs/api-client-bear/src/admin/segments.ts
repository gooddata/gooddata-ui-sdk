// (C) 2007-2020 GoodData Corporation
import {
    interpolate,
    parse,
    CONTRACT_DATA_PRODUCT_SEGMENT,
    CONTRACT_DATA_PRODUCT_SEGMENT_RENAME,
    CONTRACT_DATA_PRODUCT_SEGMENTS,
    CONTRACT_DOMAIN,
} from "./routes";
import * as domainSegments from "./domainSegments";
import { ApiResponse, XhrModule } from "../xhr";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const transformSegment = (item: any) => {
    const { contractId, dataProductId }: any = parse(item.segment.links.self, CONTRACT_DATA_PRODUCT_SEGMENT);

    const segment = {
        contractId,
        dataProductId,
        ...item.segment,
    };

    if (segment.domainSegments) {
        segment.domainSegments = segment.domainSegments.map(domainSegments.transformDomainSegment);
    }

    return segment;
};

export class SegmentsModule {
    constructor(private xhr: XhrModule) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getDataProductSegments(contractId: string, dataProductId: string) {
        return this.xhr
            .get(interpolate(CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId }))
            .then((r: ApiResponse) => r.getData())
            .then((data: any) => ({
                items: data.segments.items.map(transformSegment),
                status: data.segments.status,
            }));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public createSegment(contractId: string, dataProductId: string, segmentId: string, domainIds: string[]) {
        return this.xhr.post(interpolate(CONTRACT_DATA_PRODUCT_SEGMENTS, { contractId, dataProductId }), {
            body: JSON.stringify({
                segmentCreate: {
                    id: segmentId,
                    title: segmentId,
                    domains: domainIds.map((domainId: string) =>
                        interpolate(CONTRACT_DOMAIN, { contractId, domainId }),
                    ),
                },
            }),
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public renameSegment(contractId: string, dataProductId: string, segmentId: string, newSegmentId: string) {
        return this.xhr.post(
            interpolate(CONTRACT_DATA_PRODUCT_SEGMENT_RENAME, { contractId, dataProductId, segmentId }),
            {
                body: JSON.stringify({ segmentRename: { id: newSegmentId } }),
            },
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public deleteSegment(contractId: string, dataProductId: string, segmentId: string) {
        return this.xhr.del(
            interpolate(CONTRACT_DATA_PRODUCT_SEGMENT, { contractId, dataProductId, segmentId }),
        );
    }
}
