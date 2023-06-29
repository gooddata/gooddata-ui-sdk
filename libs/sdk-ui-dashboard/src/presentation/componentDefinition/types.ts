// (C) 2022 GoodData Corporation
import { ComponentType } from "react";
import {
    IDashboardAttributeFilterProps,
    IDashboardAttributeFilterPlaceholderProps,
} from "../filterBar/types.js";
import { IDashboardInsightProps, IDashboardKpiProps, IDashboardWidgetProps } from "../widget/types.js";
import {
    AttributeFilterDraggableItem,
    CustomDraggableItem,
    DraggableContentItemType,
    IWrapCreatePanelItemWithDragComponent,
    InsightDraggableItem,
    KpiDraggableItem,
} from "../dragAndDrop/types.js";
import {
    AttributeFilterComponentProvider,
    InsightComponentProvider,
    KpiComponentProvider,
    WidgetComponentProvider,
} from "../dashboardContexts/types.js";
import { IInsightWidget, IKpiWidget } from "@gooddata/sdk-model";
import { ICustomWidget } from "../../model/index.js";

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
export type IAttributeFilterDraggingComponentProps = {
    itemType: "attributeFilter";
    item: AttributeFilterDraggableItem;
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
export type InsightDraggingComponent = ComponentType<IInsightDraggingComponentProps>;
/**
 * @internal
 */
export type KpiDraggingComponent = ComponentType<IKpiDraggingComponentProps>;

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
        | KpiDraggableComponent
        | InsightDraggableComponent
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
        CreatingPlaceholderComponent: ComponentType<TProps>;
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
 * Definition of KPI widget
 * @internal
 */
export type KpiWidgetComponentSet = CustomComponentBase<
    IDashboardKpiProps,
    Parameters<KpiComponentProvider>
> &
    DraggableComponent &
    CreatableByDragComponent &
    CreatablePlaceholderComponent<IDashboardWidgetProps> &
    ConfigurableWidget<IKpiWidget>;

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
