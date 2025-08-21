// (C) 2025 GoodData Corporation

import {
    propCombinationsFor,
    UiTooltip,
    UiTooltipProps,
    ComponentTable,
    UiButton,
} from "@gooddata/sdk-ui-kit";
import React from "react";
import { wrapWithTheme } from "../themeWrapper.js";
import tooltipImage from "./assets/tooltip-image.png";
import { ScopedThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { indigoDarkTheme, redLightTheme } from "@gooddata/sdk-ui-theme-provider/internal";

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
const allVariants = propCombination("variant", ["default", "error"]);

const UiTooltipPosition = ({ arrowPlacement, variant }: UiTooltipProps) => (
    <UiTooltip
        arrowPlacement={arrowPlacement}
        variant={variant}
        anchor={<div style={{ margin: "75px 0", width: "50px", height: "25px", backgroundColor: "gray" }} />}
        content={
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
        }
    />
);

const UiTooltipTest = ({ showCode }: { showCode?: boolean }) => (
    <div className="screenshot-target">
        <ComponentTable
            rowsBy={[allPositions]}
            columnsBy={allVariants}
            Component={UiTooltipPosition}
            codeSnippet={showCode ? "UiTooltip" : undefined}
            align="center"
            cellWidth={200}
        />
    </div>
);

const UiTooltipExample = ({ label, ...props }: Partial<UiTooltipProps> & { label: string }) => (
    <UiTooltip
        {...props}
        anchor={<UiButton size="small" variant="tertiary" label={label} />}
        content="Tooltip content"
    />
);

const UiTooltipExamples = () => {
    const arrowPlacement = "left";
    return (
        <div className="library-component">
            <h4>Triggers</h4>
            <h4>Tooltip can be triggered by hover and/or focus and closed with Escape</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["hover"]}
                label="hoverTrigger={true}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["focus"]}
                label="focusTrigger={true}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["hover", "focus"]}
                label="Hover and focus trigger combined"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["click"]}
                label="clickTrigger={true}"
            />
            <h4>Delays</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["hover"]}
                hoverOpenDelay={1000}
                label="hoverOpenDelay={1000}"
            />
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["hover"]}
                hoverCloseDelay={1000}
                label="hoverCloseDelay={1000}"
            />
            <h4>Hide arrow</h4>
            <UiTooltipExample
                arrowPlacement={arrowPlacement}
                triggerBy={["hover"]}
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
            <UiTooltip
                arrowPlacement="top"
                width="auto"
                anchor={<input type="text" />}
                content="Tooltip content"
            />
        </div>
    );
};

const ContentWithButtons = ({ isDisabled }: { isDisabled: boolean }) => (
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
            We recommend you use the API to clear the cache after every data upload to keep your analytics up
            to date. A manual "Clear cache" option is also available in the web UI
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <UiButton size="small" variant="tooltip" label={"Learn more"} isDisabled={isDisabled} />
            <UiButton size="small" label={"Got it"} />
        </div>
    </div>
);

const UiTooltipWithButtons = ({ isDisabled }: { isDisabled: boolean }) => (
    <div className="screenshot-target">
        <UiTooltip
            arrowPlacement="top-end"
            width={200}
            anchor={<div style={{ width: "20px", height: "5px", backgroundColor: "gray" }} />}
            content={<ContentWithButtons isDisabled={isDisabled} />}
        />
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

const UiTooltipScopedThemeTest: React.FC = () => (
    <div
        className="library-component"
        style={{ width: "1000px", display: "flex", justifyContent: "center", gap: "400px" }}
    >
        <div>
            <ScopedThemeProvider theme={indigoDarkTheme.theme}>
                <UiTooltipWithButtons isDisabled={false} />
            </ScopedThemeProvider>
        </div>
        <div>
            <ScopedThemeProvider theme={redLightTheme.theme}>
                <UiTooltipWithButtons isDisabled={false} />
            </ScopedThemeProvider>
        </div>
    </div>
);

export default {
    title: "15 Ui/UiTooltip",
};

export const Default = () => <UiTooltipTest />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiTooltipTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiTooltipTest showCode />;
Interface.parameters = { kind: "interface" };

export const Examples = () => <UiTooltipExamples />;
Examples.parameters = { kind: "examples" };

export const FullExampleButtons = () => <UiTooltipWithButtonsTest />;
FullExampleButtons.parameters = { kind: "full-example-buttons" };

export const ScopedTheme = () => <UiTooltipScopedThemeTest />;
ScopedTheme.parameters = { kind: "scoped-theme" };
