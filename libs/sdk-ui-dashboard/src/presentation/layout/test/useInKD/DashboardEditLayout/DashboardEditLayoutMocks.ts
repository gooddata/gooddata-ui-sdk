// (C) 2007-2022 GoodData Corporation
import { idRef, ObjRef } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { WidgetPosition, DropZoneType } from "./LayoutTypes.js";
import { newInsight } from "../../../../../_staging/insight/insightBuilder.js";

import {
    IDashboardEditLayout,
    IDashboardEditLayoutContentWidget,
    IDashboardEditLayoutContentWidgetDropzone,
    IDashboardEditLayoutContentWidgetDropzoneHotspot,
    IDashboardEditLayoutContentWidgetKpiPlaceholder,
    IDashboardEditLayoutContent,
    IDashboardEditLayoutItem,
    IDashboardEditLayoutContentWidgetNewInsightPlaceholder,
} from "./DashboardEditLayoutTypes.js";

export type DashboardEditLayoutContentGenerator = (
    ref: ObjRef,
    rowId?: string,
) => IDashboardEditLayoutContent;
export type DashboardEditLayoutRowMock = {
    title?: string;
    description?: string;
    isDropzone?: boolean;
    contentGeneratorColumnWidthAndHeightAsRatioTuples: (
        | [DashboardEditLayoutContentGenerator, number, number | undefined]
        | [DashboardEditLayoutContentGenerator, number]
        | [DashboardEditLayoutContentGenerator]
    )[];
};

export const widgetMock =
    () =>
    (ref: ObjRef): IDashboardEditLayoutContentWidget => {
        return {
            type: "widget",
            ref,
        };
    };

export const widgetDropzoneMock =
    (visType: VisType = "bar", isInitialDropzone = false, position = WidgetPosition.next) =>
    (ref: ObjRef): IDashboardEditLayoutContentWidgetDropzone => {
        return {
            type: "widgetDropzone",
            dragZoneWidget: {
                dropzone: {
                    ref,
                    widgetType: "insight",
                    content: newInsight(`local:${visType}`, (m) => m.title("Some vis").uri("gdc/some/vis")),
                    isInitialDropzone,
                    position,
                },
            },
            ref,
        };
    };

export const widgetDropzoneHotspotMock =
    (widgetRef: ObjRef, dropZoneType = DropZoneType.next) =>
    (ref: ObjRef): IDashboardEditLayoutContentWidgetDropzoneHotspot => {
        return {
            type: "widgetDropzoneHotspot",
            dropZoneType,
            ref,
            widgetRef,
        };
    };

export const widgetKpiPlaceholderMock =
    () =>
    (ref: ObjRef): IDashboardEditLayoutContentWidgetKpiPlaceholder => {
        return {
            type: "widgetKpiPlaceholder",
            ref,
        };
    };

export const widgetNewInsightPlaceholderMock =
    () =>
    (ref: ObjRef): IDashboardEditLayoutContentWidgetNewInsightPlaceholder => {
        return {
            type: "widgetNewInsightPlaceholder",
            ref,
        };
    };

export const rowMock = (
    contentGeneratorColumnWidthAndHeightAsRatioTuples: (
        | [DashboardEditLayoutContentGenerator, number, number | undefined]
        | [DashboardEditLayoutContentGenerator, number]
        | [DashboardEditLayoutContentGenerator]
    )[],
    title?: string,
    description?: string,
    isDropzone?: boolean,
): DashboardEditLayoutRowMock => {
    return {
        contentGeneratorColumnWidthAndHeightAsRatioTuples,
        title,
        description,
        isDropzone,
    };
};

export const getWidgetMockRef = (itemIndex: number, sectionIndex: number) =>
    idRef(`widget_${itemIndex}_row_${sectionIndex}`);

export const layoutMock = (rowMocks: DashboardEditLayoutRowMock[]): IDashboardEditLayout => {
    const emptyLayout: IDashboardEditLayout = {
        type: "IDashboardLayout",
        sections: [],
    };

    return rowMocks.reduce((acc: IDashboardEditLayout, rowMock, sectionIndex) => {
        const rowId = `row_${sectionIndex}`;

        if (!acc.sections[sectionIndex]) {
            acc.sections[sectionIndex] = {
                type: "IDashboardLayoutSection",
                items: [],
                ...(rowMock.title || rowMock.description
                    ? {
                          header: {
                              title: rowMock.title,
                              description: rowMock.description,
                          },
                      }
                    : {}),
            };
        }

        return rowMock.contentGeneratorColumnWidthAndHeightAsRatioTuples.reduce(
            (
                acc2: IDashboardEditLayout,
                [contentGenerator, gridWidth = 12, heightAsRatio = undefined],
                itemIndex,
            ) => {
                const widgetRef = getWidgetMockRef(itemIndex, sectionIndex);
                const widget = contentGenerator(widgetRef, rowId);
                const item: IDashboardEditLayoutItem = {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridWidth,
                        },
                    },
                    widget,
                };
                if (heightAsRatio) {
                    item.size.xl.heightAsRatio = heightAsRatio;
                }
                acc2.sections[sectionIndex].items[itemIndex] = item;
                return acc2;
            },
            acc,
        );
    }, emptyLayout);
};
