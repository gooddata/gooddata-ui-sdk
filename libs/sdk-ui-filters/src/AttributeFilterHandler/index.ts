// (C) 2022-2025 GoodData Corporation
export type * from "./types/index.js";
export type {
    IAttributeFilterHandlerOptions,
    IAttributeFilterHandlerOptionsBase,
    IMultiSelectAttributeFilterHandlerOptions,
    ISingleSelectAttributeFilterHandlerOptions,
} from "./factory.js";
export { newAttributeFilterHandler } from "./factory.js";

export { isLimitingAttributeFiltersEmpty } from "./utils.js";
