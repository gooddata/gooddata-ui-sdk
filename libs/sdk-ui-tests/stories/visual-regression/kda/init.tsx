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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.City.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.City.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
        },
    },
    {
        id: "6",
        type: "interactive",
        stringTitle: "Country",
        isSignificant: true,
        attribute: ReferenceMd.Activity.Default.attribute.displayForm,
        mean: 1,
        standardDeviation: 1,
    },
    {
        id: "7",
        type: "interactive",
        stringTitle: "Country",
        isSignificant: true,
        attribute: ReferenceMd.Activity.Default.attribute.displayForm,
        mean: 1,
        standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
            isSignificant: true,
            attribute: ReferenceMd.Activity.Default.attribute.displayForm,
            mean: 1,
            standardDeviation: 1,
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
        },
    },
] as IUiListboxInteractiveItem<KdaItem>[];

export const dialogFullLoadingState: Partial<KdaState> = {
    separators: {
        thousand: ",",
        decimal: ".",
    },
};
export const dialogContentLoadingState: Partial<KdaState> = {
    ...dialogFullLoadingState,
    definition: {
        metric: {
            measure: {
                localIdentifier: "metric-1",
                definition: {
                    inlineDefinition: {
                        maql: "SELECT 1",
                    },
                },
                title: "Revenue",
            },
        },
        dateAttribute: ReferenceMd.DateDatasets.Created.CreatedMonthYear,
        type: "previous_period",
        range: [
            {
                date: "2024-02",
                value: 100,
                format: {
                    locale: "en-US",
                    pattern: "MM/yyyy",
                },
            },
            {
                date: "2024-03",
                value: 300,
                format: {
                    locale: "en-US",
                    pattern: "MM/yyyy",
                },
            },
        ],
    },
    definitionStatus: "success",
};
export const dialogDetailsLoadingState: Partial<KdaState> = {
    ...dialogContentLoadingState,
    items: fewItems,
    itemsStatus: "success",
    selectedAttributes: [
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
                        <KdaDialog showCloseButton onClose={action("onClose")} />
                    </KdaStateProvider>
                </KdaStoreProvider>
            </IntlWrapper>
        </div>
    );
}
