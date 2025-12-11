// (C) 2021-2025 GoodData Corporation

import { IAttributeElement } from "@gooddata/sdk-model";

import { AttributeElementKey } from "../../../types/index.js";
import { AttributeFilterState } from "../store/state.js";

/**
 * Special key used to represent null values in the cache.
 * @internal
 */
export const NULL_KEY = "**__null__**";

/**
 * @internal
 */
export const selectState = (state: AttributeFilterState) => state;

/**
 * Converts an element key to a cache key. Null keys are converted to the NULL_KEY.
 * @param key - The key to convert to a cache key. If the key is null, the NULL_KEY is returned.
 * @returns The cache key.
 * @internal
 */
export const toCacheKey = (key: AttributeElementKey): string => (key === null ? NULL_KEY : key);

/**
 * Gets the original key (uri) for an attribute element.
 * @param element - The attribute element.
 * @returns The original element key (uri).
 * @internal
 */
export const getElementKey = (element: IAttributeElement): string | null => element.uri;

/**
 * Gets the cache key for an attribute element.
 * @param element - The attribute element.
 * @returns The cache key (uri converted to cache-safe key).
 * @internal
 */
export const getElementCacheKey = (element: IAttributeElement): string => toCacheKey(element.uri);

/**
 * @internal
 */
export const selectElementsForm = (state: AttributeFilterState) => state.elementsForm;

/**
 * @internal
 */
export const selectWithoutApply = (state: AttributeFilterState) => state.config.withoutApply;
