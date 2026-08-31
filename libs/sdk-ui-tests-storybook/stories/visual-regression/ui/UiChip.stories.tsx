// (C) 2025-2026 GoodData Corporation

import { ComponentTable, type IUiChipProps, UiChip, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "State name: Canada, Iceland, Spain, Mexico",
    tag: "(3)",
} as IUiChipProps);

const basic = propCombination("isActive", [false]);

const isActive = propCombination("isActive", [true]);

const iconBefore = propCombination("iconBefore", ["date"]);
const iconBeforeActive = propCombination("iconBefore", ["date"], { isActive: true });

const isDeletable = propCombination("isDeletable", [true]);
const isDeletableActive = propCombination("isDeletable", [true], { isActive: true });

const isLocked = propCombination("isLocked", [true]);

const isActionable = propCombination("isActionable", [true], { iconAction: "prohibited" });
const isActionableActive = propCombination("isActionable", [true], {
    isActive: true,
    iconAction: "prohibited",
});

const inactive = propCombination("variant", ["inactive"]);
const inactiveActive = propCombination("variant", ["inactive"], { isActive: true });
const inactiveDeletable = propCombination("variant", ["inactive"], { isDeletable: true });
const inactiveActionable = propCombination("variant", ["inactive"], {
    isActionable: true,
    iconAction: "prohibited",
});
const inactiveLocked = propCombination("variant", ["inactive"], { isLocked: true });

const shortLabel = propCombination("label", ["State name: All"]);
const shortLabelDeletable = propCombination("label", ["State name: All"], { isDeletable: true });
const shortLabelActionable = propCombination("label", ["State name: All"], {
    isActionable: true,
    iconAction: "prohibited",
});

const iconAfterActionable = propCombination("iconAfter", ["date"], {
    isActionable: true,
    iconAction: "prohibited",
});

const iconActionableDefault = propCombination("iconAfter", ["date"], {
    isActionable: true,
});

const withRenderActionButton = propCombination("isActionable", [true], {
    iconAction: "prohibited",
    renderActionButton: (button) => (
        <div style={{ border: "1px solid red", display: "inline-flex" }}>{button}</div>
    ),
});

const withRenderChipContent = propCombination("label", ["Render content"], {
    renderChipContent: (content) => (
        <div style={{ border: "1px solid blue", display: "inline-flex" }}>{content}</div>
    ),
});

function UiChipTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[
                    basic,
                    isActive,
                    iconBefore,
                    iconBeforeActive,
                    isDeletable,
                    isDeletableActive,
                    isLocked,
                    isActionable,
                    isActionableActive,
                    iconActionableDefault,
                    inactive,
                    inactiveActive,
                    inactiveDeletable,
                    inactiveActionable,
                    inactiveLocked,
                    shortLabel,
                    shortLabelDeletable,
                    shortLabelActionable,
                    iconAfterActionable,
                    withRenderActionButton,
                    withRenderChipContent,
                ]}
                Component={UiChip}
                codeSnippet={showCode ? "UiChip" : undefined}
                align="center"
                cellWidth={250}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiChip",
};

export function FullFeaturedChip() {
    return <UiChipTest />;
}
FullFeaturedChip.parameters = {
    kind: "full-featured chip",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiChipTest />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiChipTest showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
