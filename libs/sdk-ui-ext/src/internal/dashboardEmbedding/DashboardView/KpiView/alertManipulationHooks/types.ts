// (C) 2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export interface IUseAlertManipulationHandlerConfig {
    closeAlertDialog: () => void;
    backend: IAnalyticalBackend;
    workspace: string;
}
