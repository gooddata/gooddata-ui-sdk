// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Unique key to identify the attribute element - its uri, value or primaryKey.
 *
 * @alpha
 */
export type AttributeElementKey = string;

/**
 * @alpha
 */
export type Correlation = string;

/**
 * @alpha
 */
export type Unsubscribe = () => void;

/**
 * @alpha
 */
export type CallbackPayloadWithCorrelation<T = {}> = T & { correlation: Correlation };

/**
 * @alpha
 */
export type Callback<T> = (payload: T) => void;

/**
 * @alpha
 */
export type CallbackRegistration<T> = (cb: Callback<T>) => Unsubscribe;

/**
 * Represents the current status of the asynchronous operation.
 *
 * @alpha
 */
export type AsyncOperationStatus = "pending" | "loading" | "success" | "error" | "canceled";
