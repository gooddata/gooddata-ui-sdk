// (C) 2025 GoodData Corporation
import { UiChip, UiChipProps, ComponentTable, propCombinationsFor } from "@gooddata/sdk-ui-kit";
import React from "react";

import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "State name: Canada, Iceland, Spain, Mexico",
    tag: "(3)",
} as UiChipProps);

const basic = propCombination("isActive", [false]);

const isActive = propCombination("isActive", [true]);

const iconBefore = propCombination("iconBefore", ["date"]);
const iconBeforeActive = propCombination("iconBefore", ["date"], { isActive: true });

const isDeletable = propCombination("isDeletable", [true]);
const isDeletableActive = propCombination("isDeletable", [true], { isActive: true });

const isLocked = propCombination("isLocked", [true]);

const shortLabel = propCombination("label", ["State name: All"]);
const shortLabelDeletable = propCombination("label", ["State name: All"], { isDeletable: true });

const UiChipTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
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
                shortLabel,
                shortLabelDeletable,
            ]}
            Component={UiChip}
            codeSnippet={showCode ? "UiChip" : undefined}
            align="center"
            cellWidth={250}
        />
    </div>
);

export default {
    title: "15 Ui/UiChip",
};

export const FullFeaturedChip = () => <UiChipTest />;
FullFeaturedChip.parameters = { kind: "full-featured chip", screenshot: true };

export const Themed = () => wrapWithTheme(<UiChipTest />);
Themed.parameters = { kind: "themed", screenshot: true };

export const Interface = () => <UiChipTest showCode />;
Interface.parameters = { kind: "interface" };
