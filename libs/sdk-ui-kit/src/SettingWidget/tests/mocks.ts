// (C) 2022 GoodData Corporation

import { idRef, ITheme } from "@gooddata/sdk-model";
import { IStylingPickerItem } from "../../Dialog/index.js";

export const defaultItemMock: IStylingPickerItem<ITheme> = {
    ref: idRef("default-theme"),
    name: "Default theme",
    content: {
        palette: {
            primary: {
                base: "#14b2e2",
            },
            complementary: {
                c0: "#fff",
                c1: "#303442",
                c7: "#778491",
                c8: "#464e56",
                c9: "#000",
            },
        },
    },
};

export const customItemsMock: IStylingPickerItem<ITheme>[] = [
    {
        ref: idRef("theme1"),
        name: "First theme",
        content: {
            palette: {
                complementary: {
                    c0: "#292727",
                    c1: "#323232",
                    c2: "#424242",
                    c3: "#4E4E4E",
                    c4: "#5F5F5F",
                    c5: "#7B7B7B",
                    c6: "#A0A0A0",
                    c7: "#B9B9B9",
                    c8: "#D6D6D6",
                    c9: "#EAEAEA",
                },
            },
        },
    },
    {
        ref: idRef("theme2"),
        name: "Second theme",
        content: {
            palette: {
                complementary: {
                    c0: "#122330",
                    c1: "#1C3447",
                    c2: "#264156",
                    c3: "#324F65",
                    c4: "#40617B",
                    c5: "#4A6C89",
                    c6: "#779DBB",
                    c7: "#9DBFDA",
                    c8: "#C3DDF1",
                    c9: "#F0F8FF",
                },
            },
        },
    },
];

export const fullyDefinedThemeMock: ITheme = {
    analyticalDesigner: {
        title: {
            color: "#000",
        },
    },
    button: {
        borderRadius: "15",
        dropShadow: true,
        textCapitalization: true,
    },
    dashboards: {
        content: {
            backgroundColor: "#dfdfdf",
            kpiWidget: {
                backgroundColor: "#1b4096",
                borderColor: "#000",
                borderRadius: "4",
                borderWidth: "1",
                dropShadow: false,
                kpi: {
                    primaryMeasureColor: "#fff",
                    secondaryInfoColor: "#eba12a",
                },
                title: {
                    color: "#fff",
                    textAlign: "left",
                },
            },
            widget: {
                borderColor: "#1b4096",
                borderRadius: "50",
                borderWidth: "1",
                dropShadow: false,
                title: {
                    color: "#101010",
                    textAlign: "center",
                },
            },
        },
        filterBar: {
            backgroundColor: "#f0f0f0",
            filterButton: {
                backgroundColor: "#dfdfdf",
            },
        },
        navigation: {
            backgroundColor: "#f0f0f0",
            borderColor: "#1b4096",
            item: {
                color: "#101010",
                hoverColor: "#000",
                selectedBackgroundColor: "#1b4096",
                selectedColor: "#fff",
            },
            title: {
                color: "#000",
            },
        },
        section: {
            description: {
                color: "#101010",
            },
            title: {
                color: "#000000",
                lineColor: "#dde4eb",
            },
        },
        title: {
            color: "#ff0000",
        },
    },
    modal: {
        borderColor: "#14b2e2",
        borderRadius: "50px",
        borderWidth: "15",
        dropShadow: false,
        outsideBackgroundColor: "#ffffbf",
        title: {
            color: "#1b4096",
            lineColor: "#000",
        },
    },
    palette: {
        error: {
            base: "#ff2e5f",
        },
        info: {
            base: "#00f",
            contrast: "rgba(255,0,0,0.5)",
            dark: "rgb(0,0,125)",
            light: "rgb(100,100,255)",
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
        backgroundColor: "#101010",
        color: "#fff",
    },
    typography: {
        font: "local('Trebuchet MS')",
        fontBold: "url(https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf)",
    },
};
