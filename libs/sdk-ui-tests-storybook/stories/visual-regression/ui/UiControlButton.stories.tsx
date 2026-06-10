// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import {
    ComponentTable,
    type IUiControlButtonProps,
    UiControlButton,
    UiIcon,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const parameterIcon: ReactNode = <UiIcon type="parameter" size={16} color="currentColor" />;

const titleExtensionStar = (
    <span key="ext" style={{ marginLeft: 4 }}>
        ★
    </span>
);

const longTitle = "Region of the customer headquarters office";
const longSubtitle = "= California, Texas, New York, Florida, Washington, Oregon";

function UiControlButtonTest({
    showCode,
    layout,
}: {
    showCode?: boolean;
    layout?: IUiControlButtonProps["layout"];
}) {
    const propCombination = propCombinationsFor({
        title: "Threshold",
        subtitle: "= 25",
        layout,
    } as IUiControlButtonProps);

    const allOpen = propCombination("isOpen", [false, true]);
    const allDraggable = propCombination("isDraggable", [false, true]);
    const allError = propCombination("isError", [false, true]);
    const allDisabled = propCombination("disabled", [false, true]);
    const withIcon = propCombination("icon", [undefined, parameterIcon]);
    const withSubtitle = propCombination("subtitle", ["= 25", undefined]);
    const withTitleExtension = propCombination("titleExtension", [undefined, titleExtensionStar]);
    const withHideChevron = propCombination("hideChevron", [false, true]);

    // Row layout stretches, so widen the cells and give the wrapper a full width + border.
    const isRow = layout === "row";
    const cellWidth = isRow ? 420 : 260;

    return (
        <div className="screenshot-target" style={{ padding: 20 }}>
            <ComponentTable
                columnsBy={allOpen}
                rowsBy={[
                    allDraggable,
                    allError,
                    allDisabled,
                    withIcon,
                    withSubtitle,
                    withTitleExtension,
                    withHideChevron,
                ]}
                Component={UiControlButton}
                codeSnippet={showCode ? "UiControlButton" : undefined}
                align="center"
                cellWidth={cellWidth}
                cellStyle={isRow ? () => ({ width: "100%", border: "1px solid #ccd8e2" }) : undefined}
            />
            {/* Narrow long-text examples (truncation), different widths spread across the columns. */}
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6 }}>
                {[160, 240].map((width) => (
                    <div key={width} style={{ width, border: isRow ? "1px solid #ccd8e2" : undefined }}>
                        <UiControlButton
                            layout={layout}
                            title={longTitle}
                            subtitle={longSubtitle}
                            icon={parameterIcon}
                            isOpen
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default {
    title: "15 Ui/UiControlButton",
};

export function FullFeatured() {
    return <UiControlButtonTest />;
}
FullFeatured.parameters = {
    kind: "full-featured chip button",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiControlButtonTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiControlButtonTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;

export function RowLayout() {
    return <UiControlButtonTest layout="row" />;
}
RowLayout.parameters = {
    kind: "full-featured row layout",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const RowLayoutThemed = () => wrapWithTheme(<UiControlButtonTest layout="row" />);
RowLayoutThemed.parameters = {
    kind: "row layout themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function RowLayoutInterface() {
    return <UiControlButtonTest layout="row" showCode />;
}
RowLayoutInterface.parameters = { kind: "row layout interface" } satisfies IStoryParameters;
