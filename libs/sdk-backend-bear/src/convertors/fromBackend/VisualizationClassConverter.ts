// (C) 2019-2020 GoodData Corporation
import { IVisualizationClass } from "@gooddata/sdk-model";
import * as GdcVisualizationClass from "@gooddata/api-model-bear/GdcVisualizationClass";

export const convertVisualizationClass = (
    visClass: GdcVisualizationClass.IVisualizationClassWrapped,
): IVisualizationClass => {
    const { content, meta } = visClass.visualizationClass;
    return {
        visualizationClass: {
            ...content,
            identifier: meta.identifier!, // we assume that identifier is always defined for visualizations
            title: meta.title,
            uri: meta.uri!,
        },
    };
};
