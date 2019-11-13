// (C) 2019 GoodData Corporation
import { IVisualizationClass } from "@gooddata/sdk-model";
import { GdcVisualizationClass } from "@gooddata/gd-bear-model";

export const convertVisualizationClass = (
    visClass: GdcVisualizationClass.IVisualizationClassWrapped,
): IVisualizationClass => {
    const { content, meta } = visClass.visualizationClass;
    return {
        visualizationClass: {
            ...content,
            identifier: meta.identifier!, // we assume that identifier is always defined for visualizations
            title: meta.title,
            uri: meta.uri,
        },
    };
};
