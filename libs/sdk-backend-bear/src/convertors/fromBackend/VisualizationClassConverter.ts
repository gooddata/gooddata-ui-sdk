// (C) 2019-2020 GoodData Corporation
import { IVisualizationClass } from "@gooddata/sdk-model";
import { IVisualizationClassWrapped } from "@gooddata/api-model-bear";

export const convertVisualizationClass = (visClass: IVisualizationClassWrapped): IVisualizationClass => {
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
