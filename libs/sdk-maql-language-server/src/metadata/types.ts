// (C) 2023-2026 GoodData Corporation

import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { type LabelElementsFunc, type LdmObjects } from "./model.js";

/**
 * Interface to connect to Metadata API
 * Internals do not matter for the service, only needed is the fact that
 * the language service can asynchronously get typed identifiers and that it is able
 * to force a refresh of the stored model
 */
export interface IMetadataInterface {
    updateModel(): void;

    getLdmObjects(items?: IAttributeOrMeasure[]): Promise<LdmObjects>;

    getLabelElementsFunction(): Promise<LabelElementsFunc>;
}
