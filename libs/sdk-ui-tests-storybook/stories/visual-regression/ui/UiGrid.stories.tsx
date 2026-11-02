// (C) 2026 GoodData Corporation

import { type ReactNode, useEffect } from "react";

import { type IUiGridCellProps, UiGrid, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

interface ISwatch {
    name: string;
    color: string;
}

const THEME_COLORS: ISwatch[] = [
    "#1b1b3a",
    "#2a5bd7",
    "#3a2e6e",
    "#6b3fa0",
    "#a23b72",
    "#c0392b",
    "#d35400",
    "#e1a100",
    "#2e8b57",
    "#1f7a8c",
    "#4a5d6e",
    "#8a6d3b",
].map((color, index) => ({ name: `theme ${index + 1}`, color }));

const PALETTE: ISwatch[] = [
    { name: "c0", color: "#ffffff" },
    { name: "c1", color: "#f5f8fa" },
    { name: "c2", color: "#ebeff4" },
    { name: "c3", color: "#dde4eb" },
    { name: "c4", color: "#ccd8e2" },
    { name: "c5", color: "#b0beca" },
    { name: "c6", color: "#94a1ad" },
    { name: "c7", color: "#6d7680" },
    { name: "c8", color: "#464e56" },
    { name: "c9", color: "#000000" },
];

const SEMANTIC: ISwatch[] = [
    { name: "primary", color: "#14b2e2" },
    { name: "error", color: "#e54d42" },
    { name: "success", color: "#00c18d" },
    { name: "warning", color: "#f18600" },
];

const SWATCH_GROUPS = [THEME_COLORS, PALETTE, SEMANTIC];

const TILES = ["None", "Cover image", "Hero", "Store front", "Team photo"];

// UiTooltip's anchor wrapper hugs its content; the swatch has to fill the cell.
const TOOLTIP_ANCHOR_STYLE = { display: "block", width: "100%" } as const;

function SwatchCell({ item, isSelected, isKeyboardFocused }: IUiGridCellProps<ISwatch>) {
    const swatch = (
        <span
            role="img"
            aria-label={item.name}
            style={{
                display: "block",
                width: 20,
                height: 20,
                margin: 5,
                boxSizing: "border-box",
                border: "1px solid var(--gd-palette-complementary-3)",
                backgroundColor: item.color,
                boxShadow: isSelected
                    ? "0 0 0 1px var(--gd-palette-complementary-0), 0 0 0 2px var(--gd-palette-primary-base)"
                    : undefined,
            }}
        />
    );
    return (
        <UiTooltip
            anchor={swatch}
            anchorWrapperStyles={TOOLTIP_ANCHOR_STYLE}
            content={item.name}
            triggerBy={["hover"]}
            isOpen={isKeyboardFocused || undefined}
            accessibilityHidden
            arrowPlacement="bottom"
            optimalPlacement
        />
    );
}

function TileCell({ item, isSelected }: IUiGridCellProps<string>) {
    const borderColor = isSelected ? "var(--gd-palette-primary-base)" : "var(--gd-palette-complementary-3)";
    return (
        <span
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 60,
                border: `1px solid ${borderColor}`,
                borderRadius: 3,
            }}
        >
            {item}
        </span>
    );
}

function FocusOnMount({ selector, children }: { selector: string; children: ReactNode }) {
    useEffect(() => {
        document.querySelector<HTMLElement>(selector)?.focus();
    }, [selector]);

    return <>{children}</>;
}

function SwatchGrid({ dataTestId }: { dataTestId?: string }) {
    return (
        <UiGrid
            groups={SWATCH_GROUPS}
            getItemId={(swatch) => swatch.name}
            selectedItemId="c4"
            onPick={() => {}}
            columns={10}
            cellWidth={30}
            accessibilityConfig={{ ariaLabel: "Text color" }}
            Cell={SwatchCell}
            dataTestId={dataTestId}
        />
    );
}

function UiGridTest() {
    return (
        <div className="screenshot-target" style={{ padding: 20, display: "grid", gap: 40, width: 320 }}>
            <SwatchGrid />
            <UiGrid
                groups={[TILES]}
                getItemId={(tile) => tile}
                selectedItemId="Hero"
                onPick={() => {}}
                columns={2}
                gap={10}
                accessibilityConfig={{ ariaLabel: "Background image" }}
                Cell={TileCell}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiGrid",
};

export function Default() {
    return <UiGridTest />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function KeyboardFocus() {
    return (
        <div className="screenshot-target" style={{ padding: "60px 20px 20px", width: 320 }}>
            <FocusOnMount selector='[data-testid="s-swatches"] [role="gridcell"][tabindex="0"]'>
                <SwatchGrid dataTestId="s-swatches" />
            </FocusOnMount>
        </div>
    );
}
KeyboardFocus.parameters = {
    kind: "keyboard-focus",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        postInteractionWait: { selector: '[role="tooltip"]' },
    },
} satisfies IStoryParameters;

export function Hover() {
    return (
        <div className="screenshot-target" style={{ padding: "60px 20px 20px", width: 320 }}>
            <SwatchGrid dataTestId="s-swatches" />
        </div>
    );
}
Hover.parameters = {
    kind: "hover",
    screenshot: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        hoverSelector: '[data-testid="s-swatches"] [aria-label="error"]',
        postInteractionWait: { delay: 400 },
    },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGridTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
