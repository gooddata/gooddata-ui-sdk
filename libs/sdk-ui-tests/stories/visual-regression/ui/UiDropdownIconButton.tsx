// (C) 2025 GoodData Corporation

import React from "react";
import {
    propCombinationsFor,
    ComponentTable,
    UiDropdownIconButtonProps,
    UiDropdownIconButton,
} from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    icon: "directionRow",
} as UiDropdownIconButtonProps);

const variants = propCombination("variant", ["primary", "secondary", "tertiary"]);
const sizes = propCombination("size", ["small", "medium", "large"]);
const disabled = propCombination("isDisabled", [true]);
const open = propCombination("isDropdownOpen", [true]);

const UiDropdownIconButtonTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            columnsBy={variants}
            rowsBy={[sizes, disabled, open]}
            Component={UiDropdownIconButton}
            codeSnippet={showCode ? "UiDropdownIconButton" : undefined}
            align="center"
            cellWidth={250}
        />
    </div>
);

storiesOf(`${UiStories}/UiDropdownIconButton`)
    .add("default", () => <UiDropdownIconButtonTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiDropdownIconButtonTest />), { screenshot: true })
    .add("interface", () => <UiDropdownIconButtonTest showCode />);
