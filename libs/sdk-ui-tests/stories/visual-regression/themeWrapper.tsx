// (C) 2020 GoodData Corporation
import React from "react";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ITheme } from "@gooddata/sdk-model";

import "./themeWrapper.scss";

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
        complementary: {
            c0: "#303030",
            c9: "#ffffff",
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
    kpi: {
        primaryMeasureColor: "#f00",
        secondaryInfoColor: "#0f0",
    },
    table: {
        backgroundColor: "#303030",
        gridColor: "#fff",
        headerHoverBackgroundColor: "#888",
        headerLabelColor: "#e0e0e0",
        hoverBackgroundColor: "#555",
        nullValueColor: "#f00",
        loadingIconColor: "#0f0",
        subtotalBackgroundColor: "#00f",
        totalBackgroundColor: "#00f",
        totalValueColor: "#00f",
        valueColor: "#fff",
    },
    chart: {
        backgroundColor: "#303030",
        gridColor: "#999",
        axisColor: "#eaeaea",
        axisLabelColor: "#eaeaea",
        axisValueColor: "#eaeaea",
        legendValueColor: "#eaeaea",
        tooltipBackgroundColor: "#333",
        tooltipBorderColor: "#555",
        tooltipLabelColor: "#eaeaea",
        tooltipValueColor: "#fff",
    },
};
const themeWithFontChanged: ITheme = {
    typography: {
        font: "local(DejaVu Serif Bold)",
    },
};

const backend = recordedBackend(ReferenceRecordings.Recordings, { theme });
const backendWithFontChanged = recordedBackend(ReferenceRecordings.Recordings, {
    theme: themeWithFontChanged,
});

export const wrapWithTheme = (component: JSX.Element, tags: string[] = ["themed"]): JSX.Element =>
    tags.includes("themed") ? (
        <ThemeProvider
            workspace={workspace}
            backend={tags.includes("font") ? backendWithFontChanged : backend}
        >
            <div className="theme-wrapper">{component}</div>
        </ThemeProvider>
    ) : (
        component
    );

export const getTheme = (tags: string[] = []): ITheme => {
    if (!tags.includes("themed")) {
        return {};
    }

    if (tags.includes("font")) {
        return themeWithFontChanged;
    }

    return theme;
};
