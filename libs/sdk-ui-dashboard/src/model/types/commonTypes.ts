// (C) 2021 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Values in this context will be available to all sagas.
 *
 * @internal
 */
export type DashboardContext = {
    /**
     * Analytical Backend where the dashboard exists.
     */
    backend: IAnalyticalBackend;

    /**
     * Analytical Backend where the dashboard exists.
     */
    workspace: string;

    /**
     * Dashboard that should be loaded into the store.
     */
    dashboardRef?: ObjRef;
};
