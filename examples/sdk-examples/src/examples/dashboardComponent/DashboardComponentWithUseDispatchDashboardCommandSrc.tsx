// (C) 2022 GoodData Corporation
import React from "react";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeFilterContextSelection,
    clearDateFilterSelection,
    CustomDashboardWidgetComponent,
    DashboardConfig,
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    resetAttributeFilterSelection,
    selectFilterContextAttributeFilterByDisplayForm,
    useDashboardSelector,
    useDispatchDashboardCommand,
} from "@gooddata/sdk-ui-dashboard";
import {
    idRef,
    attributeDisplayFormRef,
    newNegativeAttributeFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { useDashboardLoader } from "@gooddata/sdk-ui-loaders";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import * as Md from "../../md/full";

const dashboardRef = idRef("aeO5PVgShc0T");
const config: DashboardConfig = { mapboxToken: MAPBOX_TOKEN, isReadOnly: true };

/*
 * Component to render 'myCustomWidget'. If you create custom widget instance and also pass extra data,
 * then that data will be available in the `widget` prop.
 */
const MyCustomWidget: CustomDashboardWidgetComponent = () => {
    /**
     * Creating necessary commands to dispatch filter selection change related commands.
     */
    const changeAttributeFilterSelectionCmd = useDispatchDashboardCommand(changeAttributeFilterSelection);
    const resetAttributeFilter = useDispatchDashboardCommand(resetAttributeFilterSelection);
    const changeDateFilterSelectionCmd = useDispatchDashboardCommand(changeDateFilterSelection);
    const resetDateFilter = useDispatchDashboardCommand(clearDateFilterSelection);
    const changeFilterContextSelectionCmd = useDispatchDashboardCommand(changeFilterContextSelection);

    /**
     * Select the attribute filter's local identifier from the filter's display form.
     */
    const restaurantCategoryFilterLocalId = useDashboardSelector(
        selectFilterContextAttributeFilterByDisplayForm(attributeDisplayFormRef(Md.RestaurantCategory)),
    )?.attributeFilter.localIdentifier;

    /**
     * Callbacks for the buttons.
     *
     * On {@link changeRestaurantCategoryFilterSelection}, {@link resetRestaurantCategoryFilterSelection} and {@link changeDashboardDateFilterSelection}
     * examples you can see how to call the command created by the useDispatchDashboardCommand hook with payload properties.
     *
     * {@link resetDashboardDateFilter} is an example on how to dispatch command without these properties.
     */
    const changeRestaurantCategoryFilterSelection = () => {
        restaurantCategoryFilterLocalId &&
            changeAttributeFilterSelectionCmd(
                restaurantCategoryFilterLocalId,
                {
                    uris: ["/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2196/elements?id=1"],
                },
                "IN",
            );
    };

    const resetRestaurantCategoryFilterSelection = () => {
        restaurantCategoryFilterLocalId && resetAttributeFilter(restaurantCategoryFilterLocalId);
    };

    const changeDashboardDateFilterSelection = () => {
        changeDateFilterSelectionCmd("relative", "GDC.time.year", -3, 0);
    };

    const resetDashboardDateFilter = () => {
        resetDateFilter();
    };

    const changeMultipleFilters = () => {
        // set the restaurant category filter and date filter using a single command
        changeFilterContextSelectionCmd([
            newNegativeAttributeFilter(Md.RestaurantCategory, {
                uris: ["/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2196/elements?id=1"],
            }),
            newRelativeDateFilter(Md.DateDatasets.Date, "GDC.time.year", -10, 0),
        ]);
    };

    return (
        <div>
            <button onClick={changeRestaurantCategoryFilterSelection}>
                Change Restaurant category selection
            </button>
            <button onClick={resetRestaurantCategoryFilterSelection}>Reset Restaurant category filter</button>
            <button onClick={changeDashboardDateFilterSelection}>Change date filter selection</button>
            <button onClick={resetDashboardDateFilter}>Clear date filter selection</button>
            <button onClick={changeMultipleFilters}>Change multiple filters at once</button>
        </div>
    );
};

class LocalPlugin extends DashboardPluginV1 {
    public readonly author = "John Doe";
    public readonly displayName = "Sample local plugin";
    public readonly version = "1.0";

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling,
    ): void {
        customize.customWidgets().addCustomWidget("myCustomWidget", MyCustomWidget);
        customize.layout().customizeFluidLayout((_layout, customizer) => {
            customizer.addSection(
                0,
                newDashboardSection(
                    "Buttons to dispatch filter commands",
                    newDashboardItem(newCustomWidget("myWidget1", "myCustomWidget"), {
                        xl: {
                            // all 12 columns of the grid will be 'allocated' for this new item
                            gridWidth: 12,
                            // medium height to fit the chart
                            gridHeight: 3,
                        },
                    }),
                ),
            );
        });
    }
}

const LocalExtraPlugin = {
    factory: () => new LocalPlugin(),
};

const DashboardComponentWithUseDispatchDashboardCommand: React.FC = () => {
    const { status, result, error } = useDashboardLoader({
        dashboard: dashboardRef,
        // indicate that only local plugins should be used
        loadingMode: "staticOnly",
        // define the extra plugins, this can also be an array
        extraPlugins: LocalExtraPlugin,
    });

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (error) {
        return <div>Error loading dashboard...</div>;
    }

    // the loader result returns the component to be used
    // and also props that need to be passed to it
    const { DashboardComponent, props: dashboardProps } = result!;
    return (
        <div>
            <DashboardComponent {...dashboardProps} config={config} />
        </div>
    );
};

export default DashboardComponentWithUseDispatchDashboardCommand;
