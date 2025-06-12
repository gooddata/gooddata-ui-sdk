// (C) 2024 GoodData Corporation

import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";
import { AddButton } from "@gooddata/sdk-ui-kit";
import { action } from "@storybook/addon-actions";

const onClick = () => {
    action("onClick");
};

const AddButtonTest = () => {
    return (
        <div className="library-component screenshot-target">
            <h4>Default</h4>
            <AddButton title={<>Create</>} onClick={onClick} />

            <h4>Disabled</h4>
            <AddButton title={<>Can&apos;t touch this</>} isDisabled={true} onClick={onClick} />

            <h4>With tooltip</h4>
            <AddButton title={<>Hover</>} tooltip={<>Some information here!</>} onClick={onClick} />
        </div>
    );
};

storiesOf(`${UiKit}/AddButton`)
    .add("full-featured", () => <AddButtonTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<AddButtonTest />), { screenshot: true });
