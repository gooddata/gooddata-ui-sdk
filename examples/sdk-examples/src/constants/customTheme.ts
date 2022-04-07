// (C) 2020-2022 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";

export const customTheme: ITheme = {
    button: {
        borderRadius: "15",
        dropShadow: true,
        textCapitalization: true,
    },
    modal: {
        borderColor: "#1b4096",
        borderRadius: "5",
        borderWidth: "2",
        dropShadow: false,
        outsideBackgroundColor: "#e8cda2",
        title: {
            color: "#1b4096",
            lineColor: "#000",
        },
    },
    palette: {
        error: {
            base: "#ff2e5f",
        },
        primary: {
            base: "#eba12a",
        },
        success: {
            base: "#13ed4d",
        },
        warning: {
            base: "#ddff19",
        },
        complementary: {
            c0: "#303030",
            c9: "#ffffff",
        },
    },
    tooltip: {
        backgroundColor: "#101050",
        color: "#fff",
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
    typography: {
        font: "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf)",
        fontBold: "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf)",
    },
};
