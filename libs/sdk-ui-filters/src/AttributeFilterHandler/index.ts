// (C) 2022-2026 GoodData Corporation

export type * from "./types/index.js";
export {
    type IAttributeFilterHandlerOptions,
    type IAttributeFilterHandlerOptionsBase,
    type IMultiSelectAttributeFilterHandlerOptions,
    type ISingleSelectAttributeFilterHandlerOptions,
    newAttributeFilterHandler,
} from "./factory.js";

export { isLimitingAttributeFiltersEmpty } from "./utils.js";
