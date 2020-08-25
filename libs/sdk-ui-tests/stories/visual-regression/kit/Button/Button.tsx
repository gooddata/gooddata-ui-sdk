// (C) 2020 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "@storybook/react";
// import { action } from "@storybook/addon-actions";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${UiKit}/Button`, module).add("full-featured", () => {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <Button type="primary" value={"I am GoodData primary button!"}/>
            <Button type="action" value={"I am GoodData action button!"}/>
            <Button type="negative" value={"I am GoodData action button!"}/>
        </div>
    ); /*
        {
            closed: {},
            opened: {
                clickSelector: ".s-measure-number-format-button",
                postInteractionWait: 2000 },
            "custom-editor": {
                clickSelectors: [".s-measure-number-format-button", ".s-format-preset-customFormat"],
                postInteractionWait: 2000,
            },
            "custom-editor-extended-preview": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-custom-format-dialog-extended-preview-button",
                ],
                postInteractionWait: 2000,
            },
            "custom-editor-templates": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-measure-format-templates-toggle-button",
                ],
                postInteractionWait: 2000,
            },
            "custom-editor-templates-selected": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-measure-format-templates-toggle-button",
                    ".s-measure-format-template-decimal_number",
                ],
                postInteractionWait: 2000,
            },
        },
    );*/
});
