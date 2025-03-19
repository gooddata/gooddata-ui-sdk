// (C) 2022-2024 GoodData Corporation
export * from "./types/index.js";
export type {
    IAttributeFilterHandlerOptions,
    IAttributeFilterHandlerOptionsBase,
    IMultiSelectAttributeFilterHandlerOptions,
    ISingleSelectAttributeFilterHandlerOptions,
} from "./factory.js";
export { newAttributeFilterHandler } from "./factory.js";

export { isLimitingAttributeFiltersEmpty } from "./utils.js";
