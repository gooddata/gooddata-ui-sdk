// (C) 2022 GoodData Corporation
import { IAttributeFilter } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    AsyncOperationStatus,
    CallbackPayloadWithCorrelation,
    CallbackRegistration,
    Correlation,
} from "./common.js";
import { IAttributeLoader } from "./attributeLoader.js";
import { IAttributeElementLoader } from "./elementsLoader.js";

/**
 * Handles the loading of the all required metadata for the attribute filter handler.
 *
 * @public
 */
export interface IAttributeFilterLoader extends IAttributeLoader, IAttributeElementLoader {
    /**
     * Get the effective filter.
     */
    getFilter(): IAttributeFilter;

    /**
     * Loads all the required data to initialize the attribute filter handler:
     * attribute, selected attribute elements, initial elements page and elements total count.
     *
     * @remarks
     * Cancels the running initialization, if any, and starts it again.
     *
     * Throws error if you combine staticElements with unsupported elements load options (limitingAttributeFilters, limitingMeasures or limitingDateFilters).
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    init(correlation?: Correlation): void;

    /**
     * Returns the current status of the initialization.
     */
    getInitStatus(): AsyncOperationStatus;

    /**
     * Returns error, if it was thrown during the initialization, undefined otherwise.
     */
    getInitError(): GoodDataSdkError | undefined;

    /**
     * Registers a callback that will be fired when the initialization starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onInitStart: CallbackRegistration<OnInitStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initialization is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onInitSuccess: CallbackRegistration<OnInitSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the initialization.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onInitError: CallbackRegistration<OnInitErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the initialization was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onInitCancel: CallbackRegistration<OnInitCancelCallbackPayload>;

    /**
     * Registers a callback that will be fired when some data of the attribute filter handler has been changed/updated.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onUpdate: CallbackRegistration<void>;
}

/**
 * Payload of the onInitStart callback.
 *
 * @public
 */
export type OnInitStartCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onInitSuccess callback.
 *
 * @public
 */
export type OnInitSuccessCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onInitError callback.
 *
 * @public
 */
export type OnInitErrorCallbackPayload = CallbackPayloadWithCorrelation<{ error: GoodDataSdkError }>;

/**
 * Payload of the onInitCancel callback.
 *
 * @public
 */
export type OnInitCancelCallbackPayload = CallbackPayloadWithCorrelation;
