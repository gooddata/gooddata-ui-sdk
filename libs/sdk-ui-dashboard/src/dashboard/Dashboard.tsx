// (C) 2021 GoodData Corporation
import React from "react";
import { FilterBarComponent, IDefaultFilterBarProps } from "../filterBar";
import { TopBarComponent } from "../topBar";
import { FilterBarEventHandler } from "../filterBar/FilterBar";
import { IDefaultTopBarProps, TopBarEventHandler } from "../topBar/TopBar";
import { MenuButtonItem } from "../topBar/DashboardMenuButton";
import { IDashboardAttributeFilterProps } from "../filterBar/DashboardAttributeFilter";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { DashboardWidget } from "./DashboardWidget";
import { idRef } from "@gooddata/sdk-model";

export type DashboardEventHandler = FilterBarEventHandler &
    TopBarEventHandler & {
        /**
         * Emitted when the dashboard loading starts.
         */
        onDashboardLoading?: () => void;

        /**
         * Emitted when the dashboard successfully loads.
         *
         * @param dashboardData - data loaded for the dashboard
         */
        onDashboardLoaded?: (dashboardData: any) => void;

        /**
         * Emitted when the dashboard loading fails.
         *
         * @param e - error that has occurred
         */
        onDashboardLoadFailed?: (e: Error) => void;
    };

/**
 * @internal
 */
export interface IDashboardProps {
    /**
     * Optionally configure how the top bar looks and behaves.
     */
    topBarConfig?: {
        /**
         * Optionally specify component to use for rendering and handling the dashboard's Top Bar.
         *
         * If not specified the default {@link TopBar} will be used. If you do not want to render the top bar, then
         * use the {@link NoTopBar} component.
         */
        Component?: TopBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Top bar.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: IDefaultTopBarProps;
    };

    /**
     * Optionally configure how the filter bar looks and behaves
     */
    filterBarConfig?: {
        /**
         * Specify component to use for rendering and handling the dashboard's Filter Bar.
         *
         * If not specified the default {@link FilterBar} will be used. If you do not want to render the filter bar, then
         * use the {@link HiddenFilterBar} component.
         */
        Component?: FilterBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Filter Bar
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: IDefaultFilterBarProps;
    };

    /**
     * Optionally configure how the dashboard layout looks and behaves.
     *
     * TODO: flesh out interfaces & types; this is where existing stuff from DashboardView / DashboardLayout will
     *  start connecting up.
     */
    dashboardLayoutConfig?: {
        /**
         * Specify component to use for rendering the layout.
         *
         * If not specified the default {@link DashboardLayout} will be used.
         *
         * If you want to implement an ad-hoc dashboard layout yourself, you can provide children render function
         *
         */
        Component?: any;

        /**
         * Optionally specify props to customize the default implementation of Dashboard View.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: any;
    };

    /**
     *
     * @param layout
     */
    children?: (dashboard: any) => JSX.Element;
}

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (_props: IDashboardProps) => {
    return null;
};

/**
 * Shows how to use built-in customization to influence placement of the menu
 */
export function demonstrateCustomMenuPlacement() {
    return (
        <Dashboard
            topBarConfig={{
                defaultComponentProps: {
                    menuButtonConfig: {
                        placement: "left",
                    },
                },
            }}
        />
    );
}

/**
 * Shows how to use built-in customization to influence placement and add custom menu items
 */
export function demonstrateCustomMenuPlacementAndItem() {
    const customItem: [number, MenuButtonItem] = [
        -1,
        {
            itemId: "myItem",
            itemName: "Open My App",
            callback: () => {
                window.location.assign("/bang");
            },
        },
    ];
    return (
        <Dashboard
            topBarConfig={{
                defaultComponentProps: {
                    menuButtonConfig: {
                        placement: "left",
                        defaultComponentProps: {
                            AdditionalMenuItems: [customItem],
                        },
                    },
                },
            }}
        />
    );
}

const MyCustomAttrFilter: React.FC<IDashboardAttributeFilterProps> = (
    _props: IDashboardAttributeFilterProps,
) => {
    // custom impl.. does whatever it wants, on user selection calls `props.onFilterChanged`

    return null;
};

/**
 * Shows how to use built-in customization to have custom implementation of filter.
 */
export function demonstrateCustomAttributeFilterImpl() {
    return (
        <Dashboard
            filterBarConfig={{
                defaultComponentProps: {
                    attributeFilterConfig: {
                        Component: MyCustomAttrFilter,
                    },
                },
            }}
        />
    );
}

/**
 * Shows how to add a completely custom dashboard rendering.
 */
export function demonstrateCustomDashboardLayout() {
    return (
        <Dashboard>
            {(_dashboard: any) => {
                return (
                    <React.Fragment>
                        <h1>My Custom Dashboard</h1>
                        <div>
                            {/* dashboard widget is our component*/}
                            <DashboardWidget dateDataset={idRef("some.date.dataset")}>
                                <InsightView insight="something"></InsightView>
                            </DashboardWidget>
                        </div>
                        <div>
                            <DashboardWidget dateDataset={idRef("some.other.date.dataset")}>
                                {/* <LineChart ... /> */}
                            </DashboardWidget>
                        </div>
                    </React.Fragment>
                );
            }}
        </Dashboard>
    );
}
