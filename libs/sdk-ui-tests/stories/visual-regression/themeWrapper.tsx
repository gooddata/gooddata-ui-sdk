// (C) 2020 GoodData Corporation
import React from "react";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ITheme } from "@gooddata/sdk-backend-spi";

const workspace = "testWorkspace";
const theme: ITheme = {
    palette: {
        primary: {
            base: "#009882",
        },
        error: {
            base: "#AE1500",
        },
        success: {
            base: "#68bf00",
        },
        warning: {
            base: "#b300db",
        },
    },
    button: {
        borderRadius: "20px",
        dropShadow: false,
        textCapitalization: true,
    },
    tooltip: {
        backgroundColor: "#00594c",
        color: "#d6f7f2",
    },
    modal: {
        title: {
            color: "#009882",
            lineColor: "#00594c",
        },
        outsideBackgroundColor: "#d6f7f2",
        dropShadow: false,
        borderWidth: "0",
        borderColor: "#00594c",
        borderRadius: "20px",
    },
};
const backend = recordedBackend(ReferenceRecordings.Recordings, { theme });

export const wrapWithTheme = (component: JSX.Element): JSX.Element => (
    <ThemeProvider workspace={workspace} backend={backend}>
        {component}
    </ThemeProvider>
);
