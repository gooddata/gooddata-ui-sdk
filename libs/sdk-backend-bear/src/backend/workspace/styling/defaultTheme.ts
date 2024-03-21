// (C) 2023 GoodData Corporation

import { ITheme } from "@gooddata/sdk-model";

export const defaultTheme: ITheme = {
    typography: {
        font: "",
        fontBold: "",
    },
    palette: {
        complementary: {
            c0: "#fff",
            c9: "#000",
        },
    },
    button: {
        borderRadius: "3",
        dropShadow: true,
        textCapitalization: false,
    },
    tooltip: {
        backgroundColor: "",
        color: "#fff",
    },
    modal: {
        title:  {
            color: "#000",
            lineColor: "#dde4eb",
        },
        outsideBackgroundColor: "#eff1f3",
        dropShadow: true,
        borderWidth: "0",
        borderColor: "#dde4eb",
        borderRadius: "3",
    },
    kpi: {
        value: {
            textAlign: "",
            positiveColor: "",
            negativeColor: "",
        },
        primaryMeasureColor: "#000",
        secondaryInfoColor: "",
    },
    chart: {
        backgroundColor: "#fff",
        gridColor: "#ebebeb",
        axisColor: "#ccd6eb",
        axisLabelColor: "#6d7680",
        axisValueColor: "#94a1ad",
        legendValueColor: "",
        tooltipBackgroundColor: "",
        tooltipBorderColor: "",
        tooltipLabelColor: "",
        tooltipValueColor: "",
    },
    table: {
        backgroundColor: "",
        gridColor: "",
        valueColor: "",
        nullValueColor: "",
        loadingIconColor: "",
        hoverBackgroundColor: "",
        headerLabelColor: "",
        headerHoverBackgroundColor: "",
        totalBackgroundColor: "",
        subtotalBackgroundColor: "",
        totalValueColor: "",
    },
    // ...Rest of items

};
