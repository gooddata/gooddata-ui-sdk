// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { CallbackRegistration } from "../common";
import { IAttributeLoader } from "./attribute";
import { IAttributeElementLoader } from "./elements";

export * from "./attribute";
export * from "./elements";

/**
 * Handles the whole attribute filter experience
 * @alpha
 */
export interface IAttributeFilterLoader extends IAttributeLoader, IAttributeElementLoader {
    /**
     * Get the effective filter.
     */
    getFilter(): IAttributeFilter;

    //
    // callbacks
    //
    onInitStart: CallbackRegistration;
    onInitSuccess: CallbackRegistration;
    onInitError: CallbackRegistration<{ error: Error }>;
    onInitCancel: CallbackRegistration;
}

/**
 * @internal
 */
export interface IAttributeFilterHandlerConfig {
    readonly backend: IAnalyticalBackend;
    readonly workspace: string;
    readonly filter: IAttributeFilter;
    readonly hiddenElements?: string[];
}
