// (C) 2019 GoodData Corporation
import { MenuButtonItem } from "./topBar";
import React from "react";
import { IDashboardAttributeFilterProps } from "./filterBar";
import { DashboardWidget } from "./dashboard/DashboardWidget";
import { idRef } from "@gooddata/sdk-model";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { Dashboard } from "./dashboard";

/**
 * Shows how to use built-in customization to influence placement of the menu
 */
export function demonstrateCustomMenuPlacement(): JSX.Element {
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
export function demonstrateCustomMenuPlacementAndItem(): JSX.Element {
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
                            additionalMenuItems: [customItem],
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
export function demonstrateCustomAttributeFilterImpl(): JSX.Element {
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
export function demonstrateCustomDashboardLayout(): JSX.Element {
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
