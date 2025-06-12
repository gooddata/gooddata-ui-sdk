// (C) 2022 GoodData Corporation
import { IAttributeMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import {
    AsyncOperationStatus,
    CallbackPayloadWithCorrelation,
    CallbackRegistration,
    Correlation,
} from "./common.js";

/**
 * Handles the loading of the attribute metadata.
 *
 * @public
 */
export interface IAttributeLoader {
    /**
     * Loads the metadata object for the attribute, that is used in the attribute filter.
     *
     * @remarks
     * Cancels the running attribute filter load, if any, and starts it again.
     *
     * You can provide a correlation that will be included in the payload of all callbacks fired as a result of calling this method.
     *
     * @param correlation - correlation that will be included in all callbacks fired by this method
     */
    loadAttribute(correlation?: Correlation): void;

    /**
     * Cancels the running attribute load, if any.
     */
    cancelAttributeLoad(): void;

    /**
     * Returns the loaded attribute.
     *
     * @remarks
     * Returns undefined, if the attribute is not loaded yet.
     */
    getAttribute(): IAttributeMetadataObject | undefined;

    /**
     * Returns error, if it was thrown during the attribute filter load, undefined otherwise.
     */
    getAttributeError(): GoodDataSdkError | undefined;

    /**
     * Returns the current status of the attribute filter load.
     */
    getAttributeStatus(): AsyncOperationStatus;

    /**
     * Registers a callback that will be fired when the attribute load starts.
     * Returns unsubscribe function, that will unregister it, once called.
     *
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadAttributeStart: CallbackRegistration<OnLoadAttributeStartCallbackPayload>;

    /**
     * Registers a callback that will be fired when the attribute load is successfuly completed.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadAttributeSuccess: CallbackRegistration<OnLoadAttributeSuccessCallbackPayload>;

    /**
     * Registers a callback that will be fired when error is thrown during the attribute load.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadAttributeError: CallbackRegistration<OnLoadAttributeErrorCallbackPayload>;

    /**
     * Registers a callback that will be fired when the attribute load was canceled.
     * Returns unsubscribe function, that will unregister it.
     *
     * @remarks
     * Multiple callbacks can be registered by this function.
     *
     * @param callback - callback to run
     */
    onLoadAttributeCancel: CallbackRegistration<OnLoadAttributeCancelCallbackPayload>;
}

/**
 * Payload of the onLoadAttributeStart callback.
 *
 * @public
 */
export type OnLoadAttributeStartCallbackPayload = CallbackPayloadWithCorrelation;

/**
 * Payload of the onLoadAttributeSuccess callback.
 *
 * @public
 */
export type OnLoadAttributeSuccessCallbackPayload = CallbackPayloadWithCorrelation<{
    attribute: IAttributeMetadataObject;
}>;

/**
 * Payload of the onLoadAttributeError callback.
 *
 * @public
 */
export type OnLoadAttributeErrorCallbackPayload = CallbackPayloadWithCorrelation<{ error: GoodDataSdkError }>;

/**
 * Payload of the onLoadAttributeCancel callback.
 *
 * @public
 */
export type OnLoadAttributeCancelCallbackPayload = CallbackPayloadWithCorrelation;
