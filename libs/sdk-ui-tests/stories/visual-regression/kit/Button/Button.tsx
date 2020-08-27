// (C) 2020 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "@storybook/react";
import { ThemeProvider } from "styled-components";
// import { action } from "@storybook/addon-actions";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${UiKit}/Button`, module).add("full-featured", () => {
    const goodDataTheme = {
        gdColorHighlight: "#14b2e2",
        gdColorPositive: "#00c18d",
        gdColorNegative: "#e54d42",
    };

    return (
        <div style={wrapperStyle} className="screenshot-target">
            <ThemeProvider theme={goodDataTheme}>
                <Button type="primary" value={"I am GoodData primary button!"} />
                <Button type="secondary" value={"I am GoodData secondary button!"} />
                <Button type="action" value={"I am GoodData action button!"} />
                <Button type="positive" value={"I am GoodData positive button!"} />
                <Button type="negative" value={"I am GoodData negative button!"} />
                <Button disabled type="primary" value={"I am GoodData primary button!"} />
                <Button disabled type="secondary" value={"I am GoodData secondary button!"} />
                <Button disabled type="action" value={"I am GoodData action button!"} />
                <Button disabled type="positive" value={"I am GoodData negative button!"} />
                <Button disabled type="negative" value={"I am GoodData negative button!"} />
            </ThemeProvider>
        </div>
    ); /*
        {
            closed: {}
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
