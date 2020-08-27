// (C) 2020 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "@storybook/react";
import { ThemeProvider, DefaultTheme } from "styled-components";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${UiKit}/Button`, module).add("full-featured", () => {
    const goodDataTheme: DefaultTheme = {
        colors: {
            primary: {
                main: "#14b2e2",
                contrast: "#fff",
            },
            positive: {
                main: "#00c18d",
                contrast: "#fff",
            },
            negative: {
                main: "#e54d42",
                contrast: "#fff",
            },
        },
        typography: {
            button: {
                fontSize: "14px",
                lineHeight: "20px",
                fontFamily: "avenir, \"Helvetica Neue\", arial, sans-serif",
            }
        }
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
    );
});
