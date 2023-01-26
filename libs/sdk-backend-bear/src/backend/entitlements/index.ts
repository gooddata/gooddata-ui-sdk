// (C) 2021-2023 GoodData Corporation

import { IEntitlements } from "@gooddata/sdk-backend-spi";
import { IEntitlementDescriptor } from "@gooddata/sdk-model";

export class BearEntitlements implements IEntitlements {
    public async resolveEntitlements(): Promise<IEntitlementDescriptor[]> {
        return Promise.resolve([{ name: "PdfExports" }]);
    }
}
