// (C) 2019 GoodData Corporation
import { IVisualizationClass } from "@gooddata/sdk-model";
import { VisualizationClass } from "@gooddata/gd-bear-model";

export const convertVisualizationClass = (
    visClass: VisualizationClass.IVisualizationClassWrapped,
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
