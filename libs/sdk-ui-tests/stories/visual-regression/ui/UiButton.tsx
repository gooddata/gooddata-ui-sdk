// (C) 2020-2024 GoodData Corporation
import { UiButton, UiButtonProps, ComponentTable, propCombinationsFor } from "@gooddata/sdk-ui-kit";
import React from "react";

import { storiesOf } from "../../_infra/storyRepository.js";
import { UiStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

const propCombination = propCombinationsFor({ label: "Apply" } as UiButtonProps);

const allSizes = propCombination("size", ["small", "medium", "large"]);
const allVariants = propCombination("variant", ["primary", "secondary", "tertiary", "popout", "danger"]);
const allIconLeft = propCombination("iconBefore", ["check", "plus", "sync"]);
const allIconRight = propCombination("iconAfter", ["check", "plus", "sync"]);
const disabled = propCombination("isDisabled", [true]);

const UiButtonTest: React.FC<{ showCode?: boolean }> = ({ showCode }) => (
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

storiesOf(`${UiStories}/UiButton`)
    .add("full-featured button", () => <UiButtonTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<UiButtonTest />), { screenshot: true })
    .add("interface", () => <UiButtonTest showCode />);
