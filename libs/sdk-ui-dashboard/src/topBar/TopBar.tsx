// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import { DashboardTitle, DashboardTitleComponent, defaultTitleComponentProps } from "./DashboardTitle";
import {
    DashboardMenuButton,
    DashboardMenuButtonComponent,
    defaultMenuButtonProps,
    IDefaultMenuButtonProps,
    MenuButtonItem,
} from "./DashboardMenuButton";
import {
    DashboardButtonBar,
    DashboardButtonBarComponent,
    defaultDashboardButtonBarProps,
    IDefaultButtonBarProps,
} from "./DashboardButtonBar";
import { IntlWrapper } from "../localization/IntlWrapper";

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
export interface ITopBarTitleConfig {
    title: string;
    onTitleChanged?: (newTitle: string) => void;
}

/**
 * @internal
 */
export interface ITopBarMenuButtonConfig {
    menuItems: MenuButtonItem[];
}

/**
 * @internal
 */
export interface ITopBarProps {
    titleConfig: ITopBarTitleConfig;
    menuButtonConfig: ITopBarMenuButtonConfig;
}

const TopBarCore: React.FC<ITopBarProps & IDefaultTopBarProps> = (
    props: ITopBarProps & IDefaultTopBarProps,
) => {
    const { titleConfig, buttonBarConfig, menuButtonConfig } = props;

    const renderTitle = (): React.ReactNode => {
        const { onTitleChanged, Component } = titleConfig;
        const TitleComponent = Component || DashboardTitle;

        return (
            <div className="dash-title-wrapper">
                <TitleComponent title={props.titleConfig?.title} onTitleChanged={onTitleChanged} />
            </div>
        );
    };

    const renderButtonBar = (): React.ReactNode => {
        const Component: DashboardButtonBarComponent = buttonBarConfig?.Component || DashboardButtonBar;

        return <Component onButtonClicked={() => {}} onButtonHover={() => {}} />;
    };

    const renderMenuButton = (): React.ReactNode => {
        const Component: DashboardMenuButtonComponent = menuButtonConfig?.Component || DashboardMenuButton;
        const { menuItems } = menuButtonConfig;
        return <Component onMenuItemClicked={() => {}} onMenuItemHover={() => {}} menuItems={menuItems} />;
    };

    return (
        <div className={"dash-header"}>
            <div className={"dash-header-inner"}>
                {renderTitle()}
                {renderButtonBar()}
            </div>
            {renderMenuButton()}
        </div>
    );
};

/**
 * @internal
 */
export const TopBar: React.FC<ITopBarProps & IDefaultTopBarProps> = (props) => {
    return (
        <IntlWrapper>
            <TopBarCore {...props} />
        </IntlWrapper>
    );
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

export const defaultTopBarProps: IDefaultTopBarProps = {
    titleConfig: defaultTitleComponentProps,
    buttonBarConfig: defaultDashboardButtonBarProps,
    menuButtonConfig: defaultMenuButtonProps,
};
