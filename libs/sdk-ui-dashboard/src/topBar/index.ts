// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { ITopBarProps } from "./TopBar";

export { TopBar, NoTopBar, ITopBarProps } from "./TopBar";

/**
 * @internal
 */
export type TopBarComponent = ComponentType<ITopBarProps>;
