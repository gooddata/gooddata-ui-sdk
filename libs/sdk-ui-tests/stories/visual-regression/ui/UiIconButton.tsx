// (C) 2020-2025 GoodData Corporation
import { ComponentTable, propCombinationsFor, UiIconButton, UiIconButtonProps } from "@gooddata/sdk-ui-kit";
import React from "react";

import { UiStories } from "../../_infra/storyGroups.js";
import { storiesOf } from "../../_infra/storyRepository.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({
    label: "Icon Button Label",
    icon: "check",
} as UiIconButtonProps);

const sizes = propCombination("size", ["small", "medium", "large"]);
const variants = propCombination("variant", ["primary", "secondary", "tertiary", "popout", "danger"]);
const disabled = propCombination("isDisabled", [true]);

const UiIconButtonTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
    <div className="screenshot-target">
        <ComponentTable
            columnsBy={variants}
            rowsBy={[sizes, disabled]}
            Component={UiIconButton}
            codeSnippet={showCode ? "UiIconButton" : undefined}
            align="center"
            cellWidth={200}
        />
    </div>
);

storiesOf(`${UiStories}/UiIconButton`)
    .add("default", () => <UiIconButtonTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiIconButtonTest />), { screenshot: true })
    .add("interface", () => <UiIconButtonTest showCode />);
