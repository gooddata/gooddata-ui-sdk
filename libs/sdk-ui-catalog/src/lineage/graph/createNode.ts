// (C) 2025-2026 GoodData Corporation

import * as joint from "@joint/core";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";

import { objRefToId, objRefToType } from "../utils.js";
import { getIconData } from "./createIcon.js";

const BASE_HEIGHT = 24;
const BASE_ICON_SIZE = 16;
const PADDING = 8;
const GAP = 8;

export function createNode(node: IReferencesResult["nodes"][number]) {
    const title = node.title;

    const labelWidth = calculateTextWidth(title, 12);
    const nodeWidth = PADDING + BASE_ICON_SIZE + GAP + labelWidth + PADDING;

    const shape = new joint.shapes.standard.Rectangle({
        id: objRefToId(node),
        root: node.isRoot,
        size: { width: nodeWidth, height: BASE_HEIGHT },
    });

    shape.attr(node.isRoot ? rootStyles(title) : nodeStyles(title));
    shape.attr("icon", iconStyles(node));

    // We need to define the icon markup for it to be rendered
    shape.markup = [
        {
            tagName: "rect",
            selector: "body",
        },
        {
            tagName: "text",
            selector: "label",
        },
        {
            tagName: "path",
            selector: "icon",
        },
    ];
    return shape;
}

export function cleanupMeasurementElements() {
    if (measurementSvg) {
        document.body.removeChild(measurementSvg);
        measurementSvg = null;
        measurementText = null;
    }
}

function calculateTextWidth(text: string, fontSize: number): number {
    const [_, textNode] = getMeasurementElements();
    textNode.setAttribute("font-size", fontSize.toString());
    textNode.textContent = text;
    return textNode.getComputedTextLength();
}

function rootStyles(title: string) {
    return {
        body: {
            fill: "transparent",
            stroke: "#8f8f8f",
            strokeWidth: 2,
            rx: BASE_HEIGHT / 2,
            ry: BASE_HEIGHT / 2,
        },
        label: {
            text: title,
            fill: "#333",
            fontSize: 12,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            refX: GAP,
        },
    };
}

function nodeStyles(title: string) {
    return {
        body: {
            fill: "transparent",
            stroke: "transparent",
            strokeWidth: 2,
            rx: 0,
            ry: 0,
        },
        label: {
            text: title,
            fill: "#333",
            fontSize: 12,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            refX: GAP,
        },
    };
}

function iconStyles(node: IReferencesResult["nodes"][number]) {
    // Add icon based on type
    const type = objRefToType(node);
    const iconData = getIconData(type);

    const viewBox = iconData.viewBox.split(" ").map(Number);
    const scaleX = BASE_ICON_SIZE / viewBox[2];
    const scaleY = BASE_ICON_SIZE / viewBox[3];

    return {
        d: iconData.d.join(" "),
        stroke: iconData.stroke ?? "none",
        clipRule: iconData.clipRule,
        fillRule: iconData.fillRule,
        class: type,
        refX: PADDING,
        refY: "50%",
        yAlignment: "middle",
        transform: `translate(${-viewBox[0] * scaleX}, ${-viewBox[1] * scaleY}) scale(${scaleX}, ${scaleY})`,
    };
}

//measure

let measurementSvg: SVGSVGElement | null = null;
let measurementText: SVGTextElement | null = null;

function getMeasurementElements(): [SVGSVGElement, SVGTextElement] {
    if (!measurementSvg || !measurementText) {
        measurementSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        measurementSvg.style.visibility = "hidden";
        measurementSvg.style.position = "absolute";
        measurementSvg.style.top = "-1000px";
        measurementSvg.style.left = "-1000px";

        measurementText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        measurementSvg.appendChild(measurementText);
        document.body.appendChild(measurementSvg);
    }
    return [measurementSvg, measurementText];
}
