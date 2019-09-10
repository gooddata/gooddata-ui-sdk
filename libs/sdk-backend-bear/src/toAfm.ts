// (C) 2019 GoodData Corporation

import { IExecutionDefinition, NotImplemented } from "@gooddata/sdk-backend-spi";
import { AFM } from "@gooddata/typings";

export function toAfmExecution(_def: IExecutionDefinition): AFM.IExecution {
    throw new NotImplemented("...");
}
