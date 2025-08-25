// (C) 2020-2025 GoodData Corporation
import React from "react";

import { ComponentTable, UiButton, UiButtonProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({ label: "Apply" } as UiButtonProps);

const allSizes = propCombination("size", ["small", "medium", "large"]);
const allVariants = propCombination("variant", [
    "primary",
    "secondary",
    "tertiary",
    "popout",
    "link",
    "danger",
]);
const allIconLeft = propCombination("iconBefore", ["check", "plus", "sync"]);
const allIconRight = propCombination("iconAfter", ["check", "plus", "sync"]);
const disabled = propCombination("isDisabled", [true]);

function UiButtonTest({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                columnsBy={allVariants}
                rowsBy={[allSizes, allIconLeft, allIconRight, disabled]}
                Component={UiButton}
                codeSnippet={showCode ? "UiButton" : undefined}
                align="center"
                cellWidth={200}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiButton",
};

export function FullFeaturedButton() {
    return <UiButtonTest />;
}
FullFeaturedButton.parameters = { kind: "full-featured button", screenshot: true };

export const Themed = () => wrapWithTheme(<UiButtonTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interface() {
    return <UiButtonTest showCode />;
}
Interface.parameters = { kind: "interface" };
