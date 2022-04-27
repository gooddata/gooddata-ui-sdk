// (C) 2022 GoodData Corporation
import { ComponentType } from "react";
import { IDashboardAttributeFilterProps } from "../filterBar";
import { IDashboardKpiProps, IDashboardWidgetProps } from "../widget";

/**
 * @internal
 */
export interface CustomComponentBase<TMainProps> {
    /**
     * The main body of the component that is shown by default in view and edit modes.
     */
    MainComponent: ComponentType<TMainProps>;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DraggingComponentProps {
    // TODO define when dragging will be implemented
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DropTargetComponentProps {
    // TODO define when dragging will be implemented
}

/**
 * @internal
 */
export type DraggableItemType = "attributeFilter" | "widget" | "custom";

/**
 * Capability saying the component can be dragged somewhere.
 * @internal
 */
export type DraggableComponent = {
    dragging: {
        /**
         * Component shown when it is being dragged somewhere.
         */
        DraggingComponent: ComponentType<DraggingComponentProps>;

        /**
         * type of dragged item
         */
        type: DraggableItemType;
    };
};

/**
 * Capability saying the component can receive draggable items.
 * @internal
 */
export type DropTarget = {
    dropping: {
        /**
         * Component shown when item is dragged onto component.
         */
        DropTargetComponent: ComponentType<DropTargetComponentProps>;
    };
};

/**
 * Capability saying the component can be created by dragging it from the side drawer.
 * @internal
 */
export type CreatableByDragComponent = DraggableComponent & {
    creating: {
        /**
         * Component used to render the item in the left drawer menu used to create a new instance of this component on the dashboard
         */
        DrawerItemComponent: ComponentType;
    };
};

/**
 * Capability saying the component displays something else than the Main component while it is being configured for the first time after being created.
 * @internal
 */
export type CreatablePlaceholderComponent = {
    creating: {
        /**
         * Component used to render the item before the initial configuration is done.
         */
        CreatingPlaceholderComponent: ComponentType;
    };
};

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WidgetConfigPanelProps {
    // TODO define when config component will be defined
}

/**
 * Capability saying the component can be configured in edit mode.
 * @internal
 */
export type ConfigurableWidget = {
    configuration: {
        /**
         * Component used to render the insides of the configuration panel.
         */
        WidgetConfigPanelComponent: ComponentType<WidgetConfigPanelProps>;
    };
};

/**
 * Definition of attribute filter components
 * @internal
 */
export type AttributeFilterComponentSet = CustomComponentBase<IDashboardAttributeFilterProps> &
    DraggableComponent &
    CreatablePlaceholderComponent &
    CreatableByDragComponent;

/**
 * Definition of KPI widget
 * @internal
 */
export type KpiWidgetComponentSet = CustomComponentBase<IDashboardKpiProps> &
    DraggableComponent &
    CreatableByDragComponent &
    CreatablePlaceholderComponent &
    ConfigurableWidget;

/**
 * Definition of widget
 * @internal
 */
export type CustomWidgetComponentSet = CustomComponentBase<IDashboardWidgetProps> &
    DraggableComponent &
    Partial<ConfigurableWidget> &
    Partial<CreatableByDragComponent>;
