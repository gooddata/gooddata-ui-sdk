// (C) 2021-2026 GoodData Corporation

import { type IAttributeElement } from "@gooddata/sdk-model";

import { type AttributeElementKey } from "../../../types/index.js";
import { type IAttributeFilterState } from "../store/state.js";

/**
 * Special key used to represent null values in the cache.
 * @internal
 */
export const NULL_KEY = "**__null__**";

/**
 * @internal
 */
export const selectState = (state: IAttributeFilterState) => state;

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
export const selectElementsForm = (state: IAttributeFilterState) => state.elementsForm;

/**
 * @internal
 */
export const selectWithoutApply = (state: IAttributeFilterState) => state.config.withoutApply;
