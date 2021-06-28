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
         * Optionally specify where the topbar places the title.
         *
         * Default: left.
         */
        placement?: "left" | "right";

        /**
         * Optionally specify order of the title in case multiple components of the top bar are placed
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
         * Optionally specify where the topbar places the button bar.
         *
         * Default: right.
         */
        placement?: "left" | "right";

        /**
         * Optionally specify order of the button bar in case multiple components of the top bar are placed
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

        /**
         * Optionally provide props to customize default menu button items in {@link DashboardMenuButton}.
         *
         * These will have no effect if using custom MenuButton implementation.
         */
        defaultComponentCallbackProps?: IDefaultMenuButtonCallbackProps;
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
export interface IDefaultMenuButtonCallbackProps {
    onExportToPdfCallback?: () => void;
    onScheduleEmailingCallback?: (isDialogOpen: boolean) => void;
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
}

const TopBarTitle: React.FC<ITopBarTitleConfig & { Component?: DashboardTitleComponent }> = (props) => {
    const { Component, ...titleProps } = props;

    const Title = Component || DashboardTitle;

    return (
        <div className="dash-title-wrapper">
            <Title {...titleProps} />
        </div>
    );
};

const TopBarButtonBar: React.FC<{ Component?: DashboardButtonBarComponent }> = (props) => {
    const ButtonBar = props.Component || DashboardButtonBar;

    return <ButtonBar onButtonClicked={() => {}} onButtonHover={() => {}} />;
};

const TopBarMenuButton: React.FC<
    IDefaultMenuButtonCallbackProps & { Component?: DashboardMenuButtonComponent }
> = (props) => {
    const MenuButton = props.Component || DashboardMenuButton;

    const defaultMenuItems: MenuButtonItem[] = [
        {
            itemId: "export-to-pdf",
            itemName: "options.menu.export.PDF",
            // This will be replaced with actual call
            callback: props.onExportToPdfCallback,
        },
        {
            itemId: "schedule-emailing",
            itemName: "options.menu.schedule.email",
            // This will be replaced with actual call
            callback: props.onScheduleEmailingCallback,
        },
    ];

    return (
        <MenuButton
            onMenuItemClicked={() => {}}
            onMenuItemHover={() => {}}
            menuItems={defaultMenuItems.filter((item) => item.callback)}
        />
    );
};

const TopBarCore: React.FC<ITopBarProps & IDefaultTopBarProps> = (
    props: ITopBarProps & IDefaultTopBarProps,
) => {
    const { titleConfig, buttonBarConfig, menuButtonConfig } = props;

    return (
        <div className={"dash-header"}>
            <div className={"dash-header-inner"}>
                <TopBarTitle {...titleConfig} />
                <TopBarButtonBar Component={buttonBarConfig?.Component} />
            </div>
            <TopBarMenuButton
                Component={menuButtonConfig?.Component}
                {...menuButtonConfig?.defaultComponentCallbackProps}
            />
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
