// (C) 2021 GoodData Corporation
import { ComponentType } from "react";

///
/// Auxiliary types
///

/**
 * @internal
 */
export interface IMenuButtonItem {
    itemId: string;
    itemName: string;
    onClick?: () => void;
    /**
     * If type is not specified, then common menu button item rendered.
     */
    type?: "separator" | "header";
}

///
/// Core props
///

/**
 * The props of the title part of the TopBar.
 * @internal
 */
export interface ITitleProps {
    title: string;
    onTitleChanged?: (newTitle: string) => void;
}

/**
 * The necessary props a component must be able to handle for it to be usable as a TopBar.
 * @internal
 */
export interface ITopBarCoreProps {
    titleProps: ITitleProps;
}

/**
 * The necessary props a component must be able to handle for it to be usable as a Title.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITitleCoreProps extends ITitleProps {}

/**
 * The necessary props a component must be able to handle for it to be usable as a ButtonBar.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IButtonBarCoreProps {}

/**
 * The necessary props a component must be able to handle for it to be usable as a MenuButton.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IMenuButtonCoreProps {}

///
/// Custom component types
///

/**
 * @internal
 */
export type CustomTopBarComponent = ComponentType<ITopBarCoreProps>;

/**
 * @internal
 */
export type CustomTitleComponent = ComponentType<ITitleCoreProps>;

/**
 * @internal
 */
export type CustomButtonBarComponent = ComponentType<IButtonBarCoreProps>;

/**
 * @internal
 */
export type CustomMenuButtonComponent = ComponentType<IMenuButtonCoreProps>;

///
/// Default component props
///

/**
 * Props of the default ButtonBar implementation: {@link DefaultButtonBar}.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDefaultButtonBarProps extends IButtonBarCoreProps {}

/**
 * Props of the default Title implementation: {@link DefaultTitle}.
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDefaultTitleProps extends ITitleCoreProps {}

/**
 * Callbacks of the default MenuButton implementation: {@link DefaultMenuButton}.
 * @internal
 */
export interface IDefaultMenuButtonComponentCallbacks {
    onExportToPdfCallback?: () => void;
    onScheduleEmailingCallback?: () => void;
}

/**
 * Props of the default MenuButton implementation: {@link DefaultMenuButton}.
 * @internal
 */
export interface IDefaultMenuButtonComponentProps
    extends IMenuButtonCoreProps,
        IDefaultMenuButtonComponentCallbacks {
    /**
     * Optionally specify how the menu button looks like
     */
    ButtonComponent?: React.FC;

    /**
     * Optionally specify custom items that will be in the menu. Using this setting fully overrides the
     * menu items. The default items will not be shown.
     */
    menuItems?: IMenuButtonItem[];

    /**
     * Optionally specify additional menu items to add on top of the default items.
     *
     * If specified, this should be a list of tuples: index to add item at, the menu item to add. If you want
     * to add item at the end of the list, use index `-1`.
     */
    additionalMenuItems?: [number, IMenuButtonItem][];
}

/**
 * Props to configure the default top bar implementation.
 *
 * @internal
 */
export interface IDefaultTopBarProps extends ITopBarCoreProps {
    titleConfig?: {
        /**
         * Optionally specify custom component that the top bar will use to render the title.
         *
         * If not specified then the default implementation {@link DefaultTitle} will be used.
         */
        Component?: CustomTitleComponent;

        /**
         * Optionally specify where the TopBar places the title.
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
         * If not specified then the default implementation {@link DefaultButtonBar} will be used.
         */
        Component?: CustomButtonBarComponent;

        /**
         * Optionally specify where the TopBar places the button bar.
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
    };

    /**
     * Optionally customize menu button that is part of the top bar. This config can be used to provide an
     * arbitrary component to realize the menu
     */
    menuButtonConfig?: {
        /**
         * Optionally specify custom component that the top bar will use the render the menu button.
         *
         * If not specified then the default implementation {@link DefaultMenuButton} will be used.
         */
        Component?: CustomMenuButtonComponent;

        /**
         * Optionally specify where the TopBar places the menu button.
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
         * Optionally provide props to customize the default implementation of {@link DefaultMenuButton}.
         *
         * These will have no effect if using custom MenuButton implementation.
         */
        defaultComponentProps?: IDefaultMenuButtonComponentProps;

        /**
         * Optionally provide props to customize default menu button items in {@link DefaultMenuButton}.
         *
         * These will have no effect if using custom MenuButton implementation.
         */
        defaultComponentCallbackProps?: IDefaultMenuButtonComponentCallbacks;
    };
}
