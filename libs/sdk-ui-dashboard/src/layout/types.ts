// (C) 2020-2021 GoodData Corporation
import { FilterContextItem, IWidget, ScreenSize } from "@gooddata/sdk-backend-spi";
import { IDrillableItem, IErrorProps, IHeaderPredicate, OnError } from "@gooddata/sdk-ui";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "@gooddata/sdk-ui-ext";

/**
 * @internal
 */
export interface DashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: connect to filter bar
    filters?: FilterContextItem[];
    // TODO: create context for drillableItems / put it to store ?
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    // TODO: replace with relevant commands
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
}

/**
 * @internal
 */
export interface DashboardWidgetProps {
    widget?: IWidget;
    screen: ScreenSize;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDashboardViewDrillEvent;
    onError?: OnError;
    onFiltersChange?: (filters: IDashboardFilter[]) => void;
}
