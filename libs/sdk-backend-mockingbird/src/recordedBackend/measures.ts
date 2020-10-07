// (C) 2019-2020 GoodData Corporation

import { IWorkspaceMeasuresService, NotSupported } from "@gooddata/sdk-backend-spi";
import { ObjRef, IMeasureExpressionToken } from "@gooddata/sdk-model";

/**
 * @internal
 */
export class RecordedMeasures implements IWorkspaceMeasuresService {
    constructor() {}

    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }
}
