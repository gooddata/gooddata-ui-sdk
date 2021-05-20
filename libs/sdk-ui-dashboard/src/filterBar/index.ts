// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IFilterBarProps } from "./FilterBar";

export { FilterBar, HiddenFilterBar, IFilterBarProps, IDefaultFilterBarProps } from "./FilterBar";

/**
 * @internal
 */
export type FilterBarComponent = ComponentType<IFilterBarProps>;
