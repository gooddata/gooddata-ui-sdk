// (C) 2025-2026 GoodData Corporation

import { type ReactNode, isValidElement } from "react";

import { type IconType, iconPaths } from "@gooddata/sdk-ui-kit";

export function getIconData(type: string) {
    const iconMap: Record<string, IconType> = {
        dataSet: "date",
        insight: "visualization",
        analyticalDashboard: "dashboard",
        measure: "metric",
        fact: "fact",
        attribute: "ldmAttribute",
        displayForm: "ldmAttribute",
    };

    const iconType = iconMap[type] || "box";
    const paths = iconPaths[iconType];

    return processElement(paths);
}

interface IBuiltIcon {
    stroke: string;
    clipRule?: string;
    fillRule?: string;
    d: string[];
    viewBox: string;
}

function processElement(
    element: ReactNode,
    state: IBuiltIcon = {
        stroke: "none",
        d: [],
        viewBox: "0 0 20 20",
    },
) {
    if (isValidElement(element)) {
        const props: Record<string, string> = (element.props as Record<string, string>) ?? {};
        if (props["d"]) {
            state.d.push(props["d"]);
        }
        if (props["stroke"] && props["stroke"] !== "none") {
            state.stroke = props["stroke"];
        }
        if (props["clipRule"]) {
            state.clipRule = props["clipRule"];
        }
        if (props["fillRule"]) {
            state.fillRule = props["fillRule"];
        }
        if (props["children"]) {
            if (Array.isArray(props["children"])) {
                props["children"].forEach((c) => processElement(c, state));
            } else {
                processElement(props["children"]);
            }
        }
    }
    return state;
}
