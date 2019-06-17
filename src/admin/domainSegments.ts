// (C) 2007-2018 GoodData Corporation
import omit from "lodash/omit";

import {
    interpolate,
    parse,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLONE,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_RENAME,
    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_SYNC,
    DEPLOY_SEGMENT,
} from "./routes";
import { XhrModule, ApiResponse } from "../xhr";

export const transformDomainSegment = (item: any) => {
    const { contractId, dataProductId, segmentId, domainId }: any = parse(
        item.domainSegment.links.self,
        CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
    );

    return {
        contractId,
        dataProductId,
        segmentId,
        domainId,
        ...item.domainSegment,
    };
};

export class DomainSegmentsModule {
    constructor(private xhr: XhrModule) {}

    public getDomainSegments(contractId: string, dataProductId: string, segmentId: string, query: any) {
        return this.xhr
            .get(
                interpolate(
                    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENTS,
                    { contractId, dataProductId, segmentId },
                    query,
                ),
            )
            .then((result: any) => ({
                items: result.getData().domainSegments.items.map(transformDomainSegment),
            }));
    }

    public getDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        query: any,
    ) {
        return this.xhr
            .get(
                interpolate(
                    CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT,
                    { contractId, dataProductId, segmentId, domainId },
                    query,
                ),
            )
            .then((result: any) => transformDomainSegment(result.getData()));
    }

    public cloneDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        newSegmentId: string,
        newDomainId: string,
    ): Promise<ApiResponse> {
        return this.xhr.post(
            interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_CLONE, {
                contractId,
                dataProductId,
                segmentId,
                domainId,
            }),
            {
                body: JSON.stringify({
                    cloneSegmentRequest: {
                        clonedSegmentId: newSegmentId,
                        domain: newDomainId,
                    },
                }),
            },
        );
    }

    public deleteDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
    ): Promise<ApiResponse> {
        return this.xhr.del(
            interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT, {
                contractId,
                dataProductId,
                segmentId,
                domainId,
            }),
        );
    }

    public renameDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        newSegmentId: string,
    ): Promise<ApiResponse> {
        return this.xhr.post(
            interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_RENAME, {
                contractId,
                dataProductId,
                segmentId,
                domainId,
            }),
            {
                body: JSON.stringify({
                    domainSegmentRename: {
                        id: newSegmentId,
                    },
                }),
            },
        );
    }

    public syncDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
    ): Promise<ApiResponse> {
        return this.xhr.post(
            interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_SYNC, {
                contractId,
                dataProductId,
                segmentId,
                domainId,
            }),
        );
    }

    public deployDomainSegment(
        contractId: string,
        dataProductId: string,
        segmentId: string,
        domainId: string,
        targetDomainId: string,
        synchronize: boolean,
    ): Promise<ApiResponse> {
        return this.xhr.post(
            interpolate(
                DEPLOY_SEGMENT,
                { contractId, dataProductId, segmentId, domainId },
                synchronize && { synchronize },
            ),
            { body: JSON.stringify({ deploySegmentRequest: { domain: targetDomainId } }) },
        );
    }

    public updateDomainSegment(domainSegment: any) {
        return this.xhr
            .put(interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT, domainSegment), {
                body: JSON.stringify({
                    domainSegment: omit(domainSegment, [
                        "contractId",
                        "dataProductId",
                        "segmentId",
                        "domainId",
                    ]),
                }),
            })
            .then((result: any) => result.json())
            .then((result: any) => transformDomainSegment(result));
    }
}
