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

const propCombination = propCombinationsFor({
    title: "Threshold",
    subtitle: "= 25",
} as IUiControlButtonProps);

const allOpen = propCombination("isOpen", [false, true]);
const basic = propCombination("isDraggable", [false]);
const draggable = propCombination("isDraggable", [true]);
const error = propCombination("isError", [true]);
const warning = propCombination("isWarning", [true]);
const disabled = propCombination("disabled", [true]);
const withIcon = propCombination("icon", [parameterIcon]);
const noSubtitle = propCombination("subtitle", [undefined]);
const withTitleExtension = propCombination("titleExtension", [titleExtensionStar]);
const hiddenChevron = propCombination("hideChevron", [true]);
// Long content truncates against the button's built-in max-width inside the standard cell.
const truncation = propCombination("title", [longTitle], {
    subtitle: longSubtitle,
    icon: parameterIcon,
});
// Row layout's only production use is the fullscreen-mobile dropdown header.
const rowLayout = propCombination("layout", ["row"], {
    title: longTitle,
    subtitle: longSubtitle,
    icon: parameterIcon,
});
const rowLayoutBasic = propCombination("layout", ["row"]);

// Row-layout buttons are flat and stretch, so their cells get an explicit width and border.
function cellStyle(props: IUiControlButtonProps) {
    return props.layout === "row" ? { width: "100%", border: "1px solid #ccd8e2" } : undefined;
}

function UiControlButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target" style={{ padding: 20 }}>
            <ComponentTable
                columnsBy={allOpen}
                rowsBy={[
                    basic,
                    draggable,
                    error,
                    warning,
                    disabled,
                    withIcon,
                    noSubtitle,
                    withTitleExtension,
                    hiddenChevron,
                    truncation,
                    rowLayout,
                    rowLayoutBasic,
                ]}
                Component={UiControlButton}
                codeSnippet={showCode ? "UiControlButton" : undefined}
                align="center"
                cellWidth={260}
                cellStyle={cellStyle}
            />
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
    kind: "full-featured",
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
