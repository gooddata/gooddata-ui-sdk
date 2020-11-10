// (C) 2020 GoodData Corporation
import { ITheme } from "@gooddata/sdk-backend-spi";

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
    },
    tooltip: {
        backgroundColor: "#101050",
        color: "#fff",
    },
    typography: {
        font: "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf)",
        fontBold: "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf)",
    },
};
