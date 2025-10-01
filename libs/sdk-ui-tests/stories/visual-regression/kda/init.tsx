// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IntlWrapper,
    KdaDialog,
    KdaItem,
    KdaState,
    KdaStateProvider,
    KdaStoreProvider,
} from "@gooddata/sdk-ui-dashboard/internal";
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend.js";

function formatValue(val: number) {
    if (val < 0) {
        return `-$${Math.abs(val)}`;
    }
    return `$${val}`;
}

const backend = StorybookBackend();

export default {
    title: "18 Kda/Dialog",
};

const fewItems = [
    {
        id: "1",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "1",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Germany",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 250,
                date: "July",
            },
            formatValue,
            drivers: 7,
        },
    },
    {
        id: "2",
        type: "interactive",
        stringTitle: "Device type",
        data: {
            id: "2",
            title: "Device type",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Mobile",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 240,
                date: "July",
            },
            formatValue,
            drivers: 2,
        },
    },
    {
        id: "3",
        type: "interactive",
        stringTitle: "Device type",
        data: {
            id: "3",
            title: "Device type",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Desktop",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 230,
                date: "July",
            },
            formatValue,
            drivers: 2,
        },
    },
    {
        id: "4",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "4",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "USA",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 220,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
] as IUiListboxInteractiveItem<KdaItem>[];

const moreItems = [
    ...fewItems,
    {
        id: "5",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "5",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "USA",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 220,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
    {
        id: "6",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "6",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Africa",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 220,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
    {
        id: "7",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "7",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Europe",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 190,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
    {
        id: "8",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "8",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Europe",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 190,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
    {
        id: "9",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "9",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Europe",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 200,
                date: "July",
            },
            formatValue,
            drivers: 0,
        },
    },
    {
        id: "10",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "10",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "USA",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 220,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
    {
        id: "11",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "11",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "USA",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 220,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
] as IUiListboxInteractiveItem<KdaItem>[];

const oneItem = [
    {
        id: "8",
        type: "interactive",
        stringTitle: "Country",
        data: {
            id: "8",
            title: "Country",
            description: "There are some count drivers that rise the revenue in really interesting way.",
            category: "Europe",
            from: {
                value: 200,
                date: "June",
            },
            to: {
                value: 190,
                date: "July",
            },
            formatValue,
            drivers: 1,
        },
    },
] as IUiListboxInteractiveItem<KdaItem>[];

export const dialogFullLoadingState: Partial<KdaState> = {};
export const dialogContentLoadingState: Partial<KdaState> = {
    ...dialogFullLoadingState,
    metric: {
        title: "Revenue",
    },
    dateFilters: [{ title: "July vs June", selectedPeriod: "same_period_previous_year" }],
    attributeFilters: [
        {
            attributeFilter: {
                attributeFilter: {
                    displayForm: ReferenceMd.Activity.Subject.attribute.displayForm,
                    negativeSelection: false,
                    attributeElements: {
                        values: [],
                    },
                    localIdentifier: "localIdentifier-attributeFilter-region",
                    title: "Region",
                    selectionMode: "multi",
                    //filterElementsBy?: IDashboardAttributeFilterParent[];
                    //filterElementsByDate?: IDashboardAttributeFilterByDate[];
                    //validateElementsBy?: ObjRef[];
                },
            },
        },
    ],
    rootItem: {
        id: "1",
        title: "Country",
        description: "There are some count drivers that rise the revenue in really interesting way.",
        category: "Germany",
        from: {
            value: 200,
            date: "June",
        },
        to: {
            value: 250,
            date: "July",
        },
        formatValue,
        drivers: 7,
    },
    rootStatus: "success",
};
export const dialogDetailsLoadingState: Partial<KdaState> = {
    ...dialogContentLoadingState,
    items: fewItems,
    itemsStatus: "success",
    combinations: 1256,
    attributes: [
        ReferenceMd.Activity.Default.attribute.displayForm,
        ReferenceMd.Account.Default.attribute.displayForm,
    ],
};
export const dialogFullyLoadedState: Partial<KdaState> = {
    ...dialogDetailsLoadingState,
    selectedStatus: "success",
};
export const dialogFullyLoadedScrollState: Partial<KdaState> = {
    ...dialogFullyLoadedState,
    selectedStatus: "success",
    items: moreItems,
};
export const dialogFullyLoadedSmallState: Partial<KdaState> = {
    ...dialogFullyLoadedState,
    selectedStatus: "success",
    items: oneItem,
};

export function DialogComponent(props: { state: Partial<KdaState> }) {
    return (
        <div>
            <IntlWrapper>
                <KdaStoreProvider
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                    dashboard={
                        {
                            identifier: ReferenceMd.Dashboards.SimpleDashboard,
                            type: "analyticalDashboard",
                        } as ObjRef
                    }
                >
                    <KdaStateProvider value={props.state}>
                        <KdaDialog showCloseButton={true} onClose={action("onClose")} />
                    </KdaStateProvider>
                </KdaStoreProvider>
            </IntlWrapper>
        </div>
    );
}
