// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import classNames from "classnames";
import { isEqual, range } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { type IVisualizationClass } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

const visualizationTypeMessages = defineMessages({
    table: { id: "table" },
    line: { id: "line" },
    column: { id: "column" },
    bar: { id: "bar" },
    pie: { id: "pie" },
    headline: { id: "headline" },
    scatter: { id: "scatter" },
    heat: { id: "heat" },
    bubble: { id: "bubble" },
    bullet: { id: "bullet" },
    geo: { id: "geo" },
    combo: { id: "combo" },
    combo2: { id: "combo2" },
    heatmap: { id: "heatmap" },
    funnel: { id: "funnel" },
    pyramid: { id: "pyramid" },
    dependencywheel: { id: "dependencywheel" },
    sankey: { id: "sankey" },
    donut: { id: "donut" },
    dual: { id: "dual" },
    historgram: { id: "historgram" },
    treemap: { id: "treemap" },
    area: { id: "area" },
    pushpin: { id: "pushpin" },
    region: { id: "region" },
    choropleth: { id: "choropleth" },
    waterfall: { id: "waterfall" },
    xirr: { id: "xirr" },
    repeater: { id: "repeater" },
    radar: { id: "radar" },
    mekko: { id: "mekko" },
});

import {
    getVisualizationClassType,
    isVisualizationClassLocal,
} from "../../services/visualization_class_service.js";
import { type IVisualizationClassesState } from "../../store/visualization_classes/visualization_classes_state.js";

import { getVisualizationPickerRowLength } from "./bucketUtils.js";

interface IVisualizationPickerProps {
    selected: IVisualizationClass;
    visualizationClasses: IVisualizationClassesState;
    onClick: (visualizationType: IVisualizationClass) => void;
    enableNewGeoPushpin?: boolean;
}

export const VisualizationPicker = memo(function VisualizationPicker({
    selected,
    visualizationClasses,
    onClick,
    enableNewGeoPushpin = false,
}: IVisualizationPickerProps) {
    const intl = useIntl();
    const getRowLength = (visClassCount = visualizationClasses.length) => {
        return getVisualizationPickerRowLength(visClassCount);
    };

    const getClasses = (isFake: boolean) => {
        const rowLength = getRowLength();

        return classNames("vis", "s-visualization", {
            "vis-fake": isFake,
            "four-in-a-row": rowLength === 4,
            "five-in-a-row": rowLength === 5,
        });
    };

    const handleClick = (visualizationClass: IVisualizationClass) => {
        // deep equality on purpose — the selected class and the list entry are usually the same
        // reference, but the writers re-derive the value, so identity is not a contract
        // (store/visualization_classes/visualization_classes_state.ts)
        if (!isEqual(selected, visualizationClass)) {
            onClick(visualizationClass);
        }
    };

    const renderButton = (visualizationClass: IVisualizationClass) => {
        const type = getVisualizationClassType(visualizationClass);
        const uri = visualizationClass.visualizationClass.uri;
        const classes = getClasses(false);
        const btnClasses = classNames(
            `s-vis-button-${type}`,
            "gd-vis-type",
            isVisualizationClassLocal(visualizationClass) ? `gd-vis-type-${type}` : null,
            {
                "is-selected": isEqual(selected, visualizationClass),
            },
        );

        return (
            <span className={classes} key={uri}>
                <BubbleHoverTrigger
                    showDelay={200}
                    hideDelay={0}
                    eventsOnBubble={false}
                    className="vis-bubble-trigger"
                    key={uri}
                >
                    <button className={btnClasses} onClick={() => handleClick(visualizationClass)} />
                    <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                        {renderVisualizationTitle(visualizationClass)}
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        );
    };

    const renderVisualizationTitle = (visualizationClass: IVisualizationClass) => {
        const type = getVisualizationClassType(visualizationClass);

        const title = isVisualizationClassLocal(visualizationClass)
            ? intl.formatMessage(
                  visualizationTypeMessages[type as keyof typeof visualizationTypeMessages] ?? { id: type },
              )
            : visualizationClass.visualizationClass.title;
        return <div>{title}</div>;
    };

    const renderButtons = () => {
        const visCount = visualizationClasses.length;
        const rowLength = getRowLength();

        const realButtons = visualizationClasses.map((visualizationClass) =>
            renderButton(visualizationClass),
        );
        const fakeButtons: ReactElement[] = [];

        if (visCount % rowLength) {
            const isFake = true;
            range(rowLength - (visCount % rowLength)).forEach((key) =>
                fakeButtons.push(<span key={key} className={getClasses(isFake)} />),
            );
        }

        return [...realButtons, ...fakeButtons];
    };

    const pickerClassName = classNames("adi-visualization-picker", "s-visualization-picker", {
        "adi-visualization-picker--new-pushpin": enableNewGeoPushpin,
    });

    return <div className={pickerClassName}>{renderButtons()}</div>;
});
