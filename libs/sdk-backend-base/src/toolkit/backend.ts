// (C) 2019-2025 GoodData Corporation
import { IRequestCorrelationMetadata } from "@gooddata/sdk-backend-spi";

/**
 * @beta
 */
export type TelemetryData = {
    componentName?: string;
    props?: string[];
    /**
     * Correlation metadata to be sent to backend.
     */
    correlationMetadata?: IRequestCorrelationMetadata;
};
