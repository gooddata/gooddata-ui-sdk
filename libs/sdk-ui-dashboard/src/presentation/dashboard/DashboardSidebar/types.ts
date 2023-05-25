// (C) 2021-2022 GoodData Corporation
import { ComponentType } from "react";
import {
    AttributeFilterComponentSet,
    InsightWidgetComponentSet,
    KpiWidgetComponentSet,
} from "../../componentDefinition/index.js";
import {
    IWrapCreatePanelItemWithDragComponent,
    IWrapInsightListItemWithDragComponent,
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
     * Kpi widget component set.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    KpiWidgetComponentSet?: KpiWidgetComponentSet;

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
     * Component, that renders delete drop zone.
     * Do not set or override this property, it's injected by the Dashboard.
     *
     * @internal
     */
    DeleteDropZoneComponent?: React.ComponentType;
}

/**
 * @alpha
 */
export type CustomSidebarComponent = ComponentType<ISidebarProps>;
