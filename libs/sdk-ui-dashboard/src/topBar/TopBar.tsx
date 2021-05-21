// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { DashboardTitleComponent } from "./DashboardTitle";
import { DashboardMenuButtonComponent, IDefaultMenuButtonProps } from "./DashboardMenuButton";
import { DashboardButtonBarComponent, IDefaultButtonBarProps } from "./DashboardButtonBar";

/**
 * Props to configure the default top bar implementation.
 *
 * @internal
 */
export interface IDefaultTopBarProps {
    titleConfig?: {
        /**
         * Optionally specify custom component that the top bar will use to render the title.
         *
         * If not specified then the default implementation {@link DashboardTitle} will be used.
         */
        Component?: DashboardTitleComponent;

        /**
         * Optionally specify where the topbar places the menu button.
         *
         * Default: right.
         */
        placement?: "left" | "right";

        /**
         * Optionally specify order of the menu button in case multiple components of the top bar are placed
         * on the same side (e.g. if two components are placed on the right, this prop will influence which
         * of the two components is the rightmost)
         */
        order?: number;
    };

    buttonBarConfig?: {
        /**
         * Optionally specify custom component that the top bar will use to render the bar of control buttons.
         *
         * If not specified then the default implementation {@link DashboardButtonBar} will be used.
         */
        Component?: DashboardButtonBarComponent;

        /**
         * Optionally specify where the topbar places the menu button.
         *
         * Default: right.
         */
        placement?: "left" | "right";

        /**
         * Optionally specify order of the menu button in case multiple components of the top bar are placed
         * on the same side (e.g. if two components are placed on the right, this prop will influence which
         * of the two components is the rightmost)
         */
        order?: number;

        /**
         * Optionally provide props to customize the default implementation of the {@link DashboardButtonBar}.
         *
         * These will have no effect if using custom ButtonBar implementation.
         */
        defaultComponentProps?: IDefaultButtonBarProps;
    };

    /**
     * Optionally customize menu button that is part of the top bar. This config can be used to provide an
     * arbitrary component to realize the menu
     */
    menuButtonConfig?: {
        /**
         * Optionally specify custom component that the top bar will use the render the menu button.
         *
         * If not specified then the default implementation {@link DashboardMenuButton} will be used.
         */
        Component?: DashboardMenuButtonComponent;

        /**
         * Optionally specify where the topbar places the menu button.
         *
         * Default: right.
         */
        placement?: "left" | "right";

        /**
         * Optionally specify order of the menu button in case multiple components of the top bar are placed
         * on the same side (e.g. if two components are placed on the right, this prop will influence which
         * of the two components is the rightmost)
         */
        order?: number;

        /**
         * Optionally provide props to customize the default implementation of {@link DashboardMenuButton}.
         *
         * These will have no effect if using custom MenuButton implementation.
         */
        defaultComponentProps?: IDefaultMenuButtonProps;
    };
}

/**
 * @internal
 */
export interface ITopBarProps {
    title: string;
}

/**
 * @internal
 */
export const TopBar: React.FC<ITopBarProps & IDefaultTopBarProps> = (
    _props: ITopBarProps & IDefaultTopBarProps,
) => {
    return null;
};

/**
 * @internal
 */
export const NoTopBar: React.FC<ITopBarProps> = (_props: ITopBarProps) => {
    return null;
};

/**
 * @internal
 */
export type TopBarComponent = ComponentType<ITopBarProps>;
