// (C) 2007-2020 GoodData Corporation
import { interpolate, CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_LOG } from "./routes";
import { XhrModule } from "../xhr";

export class LogsModule {
    constructor(private xhr: XhrModule) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getLogs(contractId: string, dataProductId: string, domainId: string, segmentId: string) {
        return this.xhr
            .get(
                interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_SEGMENT_LOG, {
                    contractId,
                    dataProductId,
                    domainId,
                    segmentId,
                }),
            )
            .then((data: any) => data.logs.map((item: any) => item.log));
    }
}
