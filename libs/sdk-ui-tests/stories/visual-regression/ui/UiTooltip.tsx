// (C) 2025 GoodData Corporation

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import {
    propCombinationsFor,
    UiTooltip,
    UiTooltipContent,
    UiTooltipProps,
    UiTooltipAnchor,
    ComponentTable,
    UiButton,
} from "@gooddata/sdk-ui-kit";
import React from "react";
import { wrapWithTheme } from "../themeWrapper.js";
import tooltipImage from "./assets/tooltip-image.png";

const propCombination = propCombinationsFor({} as UiTooltipProps);

const allPositions = propCombination("arrowPlacement", [
    "top-start",
    "top",
    "top-end",
    "bottom-start",
    "bottom",
    "bottom-end",
    "left-start",
    "left",
    "left-end",
    "right-start",
    "right",
    "right-end",
]);

const UiTooltipPosition: React.FC<UiTooltipProps> = ({ arrowPlacement }) => (
    <UiTooltip arrowPlacement={arrowPlacement}>
        <UiTooltipAnchor>
            <div style={{ margin: "75px 0", width: "50px", height: "25px", backgroundColor: "gray" }} />
        </UiTooltipAnchor>
        <UiTooltipContent>
            <div
                style={{
                    height: "50px",
                    width: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {`arrow: ${arrowPlacement}`}
            </div>
        </UiTooltipContent>
    </UiTooltip>
);

const UiTooltipTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[allPositions]}
            Component={UiTooltipPosition}
            codeSnippet={showCode ? "UiTooltip" : undefined}
            align="center"
            cellWidth={200}
        />
    </div>
);

const UiTooltipExample: React.FC<UiTooltipProps & { label: string }> = ({ label, ...props }) => (
    <UiTooltip {...props}>
        <UiTooltipAnchor>
            <UiButton size="small" variant="tertiary" label={label} />
        </UiTooltipAnchor>
        <UiTooltipContent>Tooltip content</UiTooltipContent>
    </UiTooltip>
);

const UiTooltipExamples: React.FC = () => {
    const arrowPlacement = "left";
    return (
        <div className="library-component">
            <h4>Triggers</h4>
            <h4>Tooltip can be triggered by hover and/or focus and closed with Escape</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                hoverTrigger={true}
                label="hoverTrigger={true}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                focusTrigger={true}
                label="focusTrigger={true}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                focusTrigger={true}
                hoverTrigger={true}
                label="Combined trigger"
            />
            <h4>Delays</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                hoverTrigger={true}
                hoverOpenDelay={1000}
                label="hoverOpenDelay={1000}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                hoverTrigger={true}
                hoverCloseDelay={1000}
                label="hoverCloseDelay={1000}"
            />
            <h4>Hide arrow</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                hoverTrigger={true}
                showArrow={false}
                label="showArrow={false}"
            />
            <h4>Ommiting trigger props makes tooltip permanent</h4>
            <UiTooltipExample arrowPlacement={arrowPlacement} label="permanent" />
            <h4>Use optimal placement to automatically adjust tooltip position if outside viewport</h4>
            <UiTooltipExample
                arrowPlacement="right"
                optimalPlacement={true}
                label="placed on left side, optimalPlacement={true}"
            />
            <h4>Use width:auto to automatically adjust tooltip width to the anchor width</h4>
            <UiTooltip arrowPlacement="top" width="auto">
                <UiTooltipAnchor>
                    <input type="text" />
                </UiTooltipAnchor>
                <UiTooltipContent>Tooltip content</UiTooltipContent>
            </UiTooltip>
        </div>
    );
};
const UiTooltipWithButtons: React.FC<{ isDisabled: boolean }> = ({ isDisabled = false }) => (
    <div className="screenshot-target">
        <UiTooltip arrowPlacement="top-end" width={200}>
            <UiTooltipAnchor>
                <div style={{ width: "20px", height: "5px", backgroundColor: "gray" }} />
            </UiTooltipAnchor>
            <UiTooltipContent>
                <div>
                    <img
                        src={tooltipImage}
                        style={{
                            width: "200px",
                            height: "auto",
                            display: "block",
                        }}
                    />
                    <h4>Has your data been changed?</h4>
                    <p>GoodData is caching query results to optimize performance.</p>
                    <p>
                        We recommend you use the API to clear the cache after every data upload to keep your
                        analytics up to date. A manual "Clear cache" option is also available in the web UI
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <UiButton
                            size="small"
                            variant="tooltip"
                            label={"Learn more"}
                            isDisabled={isDisabled}
                        />
                        <UiButton size="small" label={"Got it"} />
                    </div>
                </div>
            </UiTooltipContent>
        </UiTooltip>
    </div>
);
const UiTooltipWithButtonsTest: React.FC = () => (
    <div
        className="library-component"
        style={{ width: "1000px", display: "flex", justifyContent: "center", gap: "400px" }}
    >
        <div>
            <h4 style={{ marginLeft: "-120px" }}>Enabled</h4>
            <UiTooltipWithButtons isDisabled={false} />
        </div>
        <div>
            <h4 style={{ marginLeft: "-120px" }}>Disabled</h4>
            <UiTooltipWithButtons isDisabled={true} />
        </div>
    </div>
);

storiesOf(`${UiStories}/UiTooltip`)
    .add("default", () => <UiTooltipTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiTooltipTest />), { screenshot: true })
    .add("interface", () => <UiTooltipTest showCode />)
    .add("examples", () => <UiTooltipExamples />)
    .add("full-example-buttons", () => <UiTooltipWithButtonsTest />);
