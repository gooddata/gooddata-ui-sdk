// (C) 2021-2025 GoodData Corporation

import { type ComponentType } from "react";

import {
    type AttributeFilterComponentSet,
    type DashboardLayoutWidgetComponentSet,
    type InsightWidgetComponentSet,
    type RichTextWidgetComponentSet,
    type VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/index.js";
import {
    type IWrapCreatePanelItemWithDragComponent,
    type IWrapInsightListItemWithDragComponent,
} from "../../dragAndDrop/types.js";

/**
 * @alpha
 */
export interface ISidebarProps {
    /**
     * Contains reference to default implementation of the sidebar. If you are implementing a custom
     * sidebar that decorates default side bar, then use this component to render the default sidebar.
     */
    DefaultSidebar: ComponentType<ISidebarProps>;

    /**
     * Specify className for configurationPanel.
     */
    configurationPanelClassName?: string;

    /**
     * Component, that adds dnd functionality to a create panel item.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;

    /**
     * Component, that adds dnd functionality to a insight list item.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;

    /**
     * Attribute filter component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    AttributeFilterComponentSet?: AttributeFilterComponentSet;

    /**
     * Insight widget component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    InsightWidgetComponentSet?: InsightWidgetComponentSet;

    /**
     * Rich text widget component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    RichTextWidgetComponentSet?: RichTextWidgetComponentSet;

    /**
     * Visualization switcher widget component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    VisualizationSwitcherWidgetComponentSet?: VisualizationSwitcherWidgetComponentSet;

    /**
     * Layout (nested) widget component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    DashboardLayoutWidgetComponentSet?: DashboardLayoutWidgetComponentSet;

    /**
     * Component, that renders delete drop zone.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    DeleteDropZoneComponent?: ComponentType;
}

/**
 * @alpha
 */
export type CustomSidebarComponent = ComponentType<ISidebarProps>;
