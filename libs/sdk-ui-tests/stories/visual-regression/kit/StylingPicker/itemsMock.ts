// (C) 2022 GoodData Corporation

import { idRef, IThemeMetadataObject } from "@gooddata/sdk-model";

export const customThemeItems: IThemeMetadataObject[] = [
    {
        id: "theme1",
        ref: idRef("theme1"),
        uri: "",
        type: "theme",
        description: "",
        production: false,
        deprecated: false,
        unlisted: false,
        title: "My first theme",
        theme: {
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
        id: "theme2",
        ref: idRef("theme2"),
        uri: "",
        type: "theme",
        description: "",
        production: false,
        deprecated: false,
        unlisted: false,
        title: "My second theme with a longer name than usual so that we can see the shortened text in action",
        theme: {
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
    {
        id: "theme3",
        ref: idRef("theme3"),
        uri: "",
        type: "theme",
        description: "",
        production: false,
        deprecated: false,
        unlisted: false,
        title: "My third theme",
        theme: {
            palette: {
                complementary: {
                    c0: "#FFFFFF",
                    c1: "#F2F2F2",
                    c2: "#EBEBEB",
                    c3: "#E3E3E3",
                    c4: "#D7D7D7",
                    c5: "#BCBCBC",
                    c6: "#9F9F9F",
                    c7: "#757575",
                    c8: "#5D5C5C",
                    c9: "#333131",
                },
            },
        },
    },
    {
        id: "theme4",
        ref: idRef("theme4"),
        uri: "",
        type: "theme",
        description: "",
        production: false,
        deprecated: false,
        unlisted: false,
        title: "My fourth theme",
        theme: {
            palette: {
                complementary: {
                    c0: "#FFFFFF",
                    c1: "#F0F4F8",
                    c2: "#E8EDF3",
                    c3: "#DAE5EE",
                    c4: "#C5D5E2",
                    c5: "#8EA3B5",
                    c6: "#62798E",
                    c7: "#516275",
                    c8: "#40505F",
                    c9: "#19222A",
                },
            },
        },
    },
];
