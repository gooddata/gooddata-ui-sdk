// (C) 2025 GoodData Corporation

import React from "react";

import { ComponentTable, UiBadge, UiBadgeProps, propCombinationsFor } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiBadge",
};

const propCombination = propCombinationsFor({} as UiBadgeProps);

const label = propCombination("label", ["badge"]);

function UiBadgeExample({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[label]}
                Component={UiBadge}
                codeSnippet={showCode ? "UiBadge" : undefined}
            />
        </div>
    );
}

export function Default() {
    return <UiBadgeExample />;
}
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiBadgeExample />);
Themed.parameters = { kind: "themed", screenshot: true };

export function Interface() {
    return <UiBadgeExample showCode />;
}
Interface.parameters = { kind: "interface" };
