// (C) 2025 GoodData Corporation

import { ComponentTable, propCombinationsFor, UiBadge, UiBadgeProps } from "@gooddata/sdk-ui-kit";
import React from "react";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiBadge",
};

const propCombination = propCombinationsFor({} as UiBadgeProps);

const label = propCombination("label", ["badge"]);

const UiBadgeExample = ({ showCode }: { showCode?: boolean }) => (
    <div className="screenshot-target">
        <ComponentTable rowsBy={[label]} Component={UiBadge} codeSnippet={showCode ? "UiBadge" : undefined} />
    </div>
);

export const Default = () => <UiBadgeExample />;
Default.parameters = { kind: "default", screenshot: true };

export const Themed = () => wrapWithTheme(<UiBadgeExample />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiBadgeExample showCode />;
Interface.parameters = { kind: "interface" };
