// (C) 2024-2025 GoodData Corporation
import { bemFactory } from "@gooddata/sdk-ui-kit";

/**
 * BEM factory for sdk-ui-ext
 *
 * @internal
 */
export const bem = (block: `gd-ui-ext-${string}`) => bemFactory<"gd-ui-ext">(block);
