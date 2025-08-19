// (C) 2022-2025 GoodData Corporation
import { ComponentType } from "react";

import {
    IDashboardLayout,
    IInsightWidget,
    IRichTextWidget,
    IVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

import { ICustomWidget } from "../../model/index.js";
import {
    AttributeFilterComponentProvider,
    DashboardLayoutComponentProvider,
    DateFilterComponentProvider,
    InsightComponentProvider,
    RichTextComponentProvider,
    VisualizationSwitcherComponentProvider,
    WidgetComponentProvider,
} from "../dashboardContexts/types.js";
import {
    AttributeFilterDraggableItem,
    CustomDraggableItem,
    DashboardLayoutDraggableItem,
    DateFilterDraggableItem,
    DraggableContentItemType,
    IWrapCreatePanelItemWithDragComponent,
    InsightDraggableItem,
    KpiDraggableItem,
    RichTextDraggableItem,
    VisualizationSwitcherDraggableItem,
} from "../dragAndDrop/types.js";
import {
    IDashboardAttributeFilterPlaceholderProps,
    IDashboardAttributeFilterProps,
    IDashboardDateFilterProps,
} from "../filterBar/types.js";
import {
    IDashboardInsightProps,
    IDashboardNestedLayoutProps,
    IDashboardRichTextProps,
    IDashboardVisualizationSwitcherProps,
    IDashboardWidgetProps,
} from "../widget/types.js";

/**
 * @internal
 */
export interface CustomComponentBase<TMainProps, TProviderParams extends any[]> {
    /**
     * The main body of the component that is shown by default in view and edit modes.
     */
    MainComponentProvider: (...params: TProviderParams) => ComponentType<TMainProps>;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DraggingComponentProps {
    // TODO define when dragging will be implemented
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DropTargetComponentProps {
    // TODO define when dragging will be implemented
}

/**
 * @internal
 */
export type IAttributeFilterDraggingComponentProps = {
    itemType: "attributeFilter";
    item: AttributeFilterDraggableItem;
};

/**
 * @internal
 */
export type IDateFilterDraggingComponentProps = {
    itemType: "dateFilter";
    item: DateFilterDraggableItem;
};

/**
 * @internal
 */
export type IInsightDraggingComponentProps = {
    itemType: "insight";
    item: InsightDraggableItem;
};

/**
 * @internal
 */
export type IKpiDraggingComponentProps = {
    itemType: "kpi";
    item: KpiDraggableItem;
};

/**
 * @internal
 */
export type IRichTextDraggingComponentProps = {
    itemType: "richText";
    item: RichTextDraggableItem;
};

/**
 * @internal
 */
export type IVisualizationSwitcherDraggingComponentProps = {
    itemType: "visualizationSwitcher";
    item: VisualizationSwitcherDraggableItem;
};

/**
 * @internal
 */
export type IDashboardLayoutDraggingComponentProps = {
    itemType: "dashboardLayout";
    item: DashboardLayoutDraggableItem;
};

/**
 * @internal
 */
export type ICustomDraggingComponentProps = {
    itemType: "custom";
    item: CustomDraggableItem;
};

/**
 * @internal
 */
export type AttributeFilterDraggingComponent = ComponentType<IAttributeFilterDraggingComponentProps>;

/**
 * @internal
 */
export type DateFilterDraggingComponent = ComponentType<IDateFilterDraggingComponentProps>;

/**
 * @internal
 */
export type InsightDraggingComponent = ComponentType<IInsightDraggingComponentProps>;

/**
 * @internal
 */
export type KpiDraggingComponent = ComponentType<IKpiDraggingComponentProps>;

/**
 * @internal
 */
export type RichTextDraggingComponent = ComponentType<IRichTextDraggingComponentProps>;

/**
 * @internal
 */
export type VisualizationSwitcherDraggingComponent =
    ComponentType<IVisualizationSwitcherDraggingComponentProps>;

/**
 * @internal
 */
export type DashboardLayoutDraggingComponent = ComponentType<IDashboardLayoutDraggingComponentProps>;

/**
 * @internal
 */
export type CustomDraggingComponent = ComponentType<ICustomDraggingComponentProps>;

/**
 * @internal
 */
export type AttributeFilterDraggableComponent = {
    DraggingComponent: AttributeFilterDraggingComponent;
    type: "attributeFilter";
};

/**
 * @internal
 */
export type DateFilterDraggableComponent = {
    DraggingComponent: DateFilterDraggingComponent;
    type: "dateFilter";
};

/**
 * @internal
 */
export type InsightDraggableComponent = {
    DraggingComponent?: InsightDraggingComponent;
    type: "insight";
};

/**
 * @internal
 */
export type KpiDraggableComponent = {
    DraggingComponent?: KpiDraggingComponent;
    type: "kpi";
};

/**
 * @internal
 */
export type RichTextDraggableComponent = {
    DraggingComponent?: RichTextDraggingComponent;
    type: "richText";
};

/**
 * @internal
 */
export type VisualizationSwitcherDraggableComponent = {
    DraggingComponent?: VisualizationSwitcherDraggingComponent;
    type: "visualizationSwitcher";
};

/**
 * @internal
 */
export type DashboardLayoutDraggableComponent = {
    DraggingComponent?: DashboardLayoutDraggingComponent;
    type: "dashboardLayout";
};

/**
 * @internal
 */
export type CustomDraggableComponent = {
    DraggingComponent: CustomDraggingComponent;
    type: "custom";
};

/**
 * Capability saying the component can be dragged somewhere.
 * @internal
 */
export type DraggableComponent = {
    dragging:
        | AttributeFilterDraggableComponent
        | DateFilterDraggableComponent
        | KpiDraggableComponent
        | InsightDraggableComponent
        | RichTextDraggableComponent
        | VisualizationSwitcherDraggableComponent
        | DashboardLayoutDraggableComponent
        | CustomDraggableComponent;
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
 * @internal
 */
export interface ICreatePanelItemComponentProps {
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;

    disabled?: boolean;
}

/**
 * @internal
 */
export type CustomCreatePanelItemComponent = ComponentType<ICreatePanelItemComponentProps>;

/**
 * Capability saying the component can be created by dragging it from the side drawer.
 * @internal
 */
export type CreatableByDragComponent = DraggableComponent & {
    creating: {
        /**
         * Component used to render the item in the left drawer menu used to create a new instance of this component on the dashboard
         */
        CreatePanelListItemComponent: CustomCreatePanelItemComponent;

        /**
         * The lower the priority, the earlier the component is shown in the drawer.
         *
         * @remarks
         * For example item with priority 0 is shown before item with priority 5
         */
        priority?: number;

        /**
         * Draggable item type for the creating item.
         */
        type: DraggableContentItemType;
    };
};

/**
 * Capability saying the component displays something else than the Main component while it is being configured for the first time after being created.
 * @internal
 */
export type CreatablePlaceholderComponent<TProps> = {
    creating: {
        /**
         * Component used to render the item before the initial configuration is done.
         */
        CreatingPlaceholderComponent?: ComponentType<TProps>;
    };
};

/**
 * @internal
 */
export type CustomWidgetConfigPanelComponent<TWidget> = ComponentType<WidgetConfigPanelProps<TWidget>>;

/**
 * @internal
 */
export interface WidgetConfigPanelProps<TWidget> {
    widget: TWidget;
}

/**
 * Capability saying the component can be configured in edit mode.
 * @internal
 */
export type ConfigurableWidget<TWidget> = {
    configuration: {
        /**
         * Component used to render the insides of the configuration panel.
         */
        WidgetConfigPanelComponent: CustomWidgetConfigPanelComponent<TWidget>;
    };
};

/**
 * Definition of attribute filter components
 * @internal
 */
export type AttributeFilterComponentSet = CustomComponentBase<
    IDashboardAttributeFilterProps,
    Parameters<AttributeFilterComponentProvider>
> &
    DraggableComponent &
    CreatablePlaceholderComponent<IDashboardAttributeFilterPlaceholderProps> &
    CreatableByDragComponent;

/**
 * Definition of date filter components
 * @internal
 */
export type DateFilterComponentSet = CustomComponentBase<
    IDashboardDateFilterProps,
    Parameters<DateFilterComponentProvider>
> &
    DraggableComponent &
    CreatablePlaceholderComponent<IDashboardAttributeFilterPlaceholderProps> & // placeholder is shared with AF
    CreatableByDragComponent;

/**
 * Definition of Insight widget
 * @internal
 */
export type InsightWidgetComponentSet = CustomComponentBase<
    IDashboardInsightProps,
    Parameters<InsightComponentProvider>
> &
    DraggableComponent &
    Partial<CreatableByDragComponent> &
    Partial<CreatablePlaceholderComponent<IDashboardWidgetProps>> &
    ConfigurableWidget<IInsightWidget>;

/**
 * Definition of RichText widget
 * @internal
 */
export type RichTextWidgetComponentSet = CustomComponentBase<
    IDashboardRichTextProps,
    Parameters<RichTextComponentProvider>
> &
    DraggableComponent &
    Partial<CreatableByDragComponent> &
    Partial<CreatablePlaceholderComponent<IDashboardWidgetProps>> &
    ConfigurableWidget<IRichTextWidget>;

/**
 * Definition of VisualizationSwitcher widget
 * @internal
 */
export type VisualizationSwitcherWidgetComponentSet = CustomComponentBase<
    IDashboardVisualizationSwitcherProps,
    Parameters<VisualizationSwitcherComponentProvider>
> &
    DraggableComponent &
    Partial<CreatableByDragComponent> &
    Partial<CreatablePlaceholderComponent<IDashboardWidgetProps>> &
    ConfigurableWidget<IVisualizationSwitcherWidget>;

/**
 * Definition of Dashboard layout widget
 * @internal
 */
export type DashboardLayoutWidgetComponentSet = CustomComponentBase<
    IDashboardNestedLayoutProps,
    Parameters<DashboardLayoutComponentProvider>
> &
    DraggableComponent &
    Partial<CreatableByDragComponent> &
    Partial<CreatablePlaceholderComponent<IDashboardNestedLayoutProps>> &
    ConfigurableWidget<IDashboardLayout>;

/**
 * Definition of widget
 * @internal
 */
export type CustomWidgetComponentSet = CustomComponentBase<
    IDashboardWidgetProps,
    Parameters<WidgetComponentProvider>
> &
    DraggableComponent &
    Partial<ConfigurableWidget<ICustomWidget>> &
    Partial<CreatableByDragComponent>;

/**
 * @internal
 */
export type InsightComponentSetProvider = (
    defaultComponentSet: InsightWidgetComponentSet,
) => InsightWidgetComponentSet;
