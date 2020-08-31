// (C) 2019-2020 GoodData Corporation

import { GdcExecution } from "@gooddata/api-model-bear";
import { IResultWarning } from "@gooddata/sdk-backend-spi";
import { isUri } from "@gooddata/api-client-bear";
import { uriRef } from "@gooddata/sdk-model";

export function convertWarning(warning: GdcExecution.Warning): IResultWarning {
    return {
        warningCode: warning.warningCode,
        message: warning.message,
        parameters: warning.parameters?.map((param) => (isUri(param) ? uriRef(param) : param)),
    };
}
