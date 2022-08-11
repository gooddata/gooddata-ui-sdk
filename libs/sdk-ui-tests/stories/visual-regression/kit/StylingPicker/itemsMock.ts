// (C) 2022 GoodData Corporation

import { idRef, ITheme } from "@gooddata/sdk-model";
import { IStylingPickerItem } from "@gooddata/sdk-ui-kit";

export const customThemeItems: IStylingPickerItem<ITheme>[] = [
    {
        ref: idRef("theme1"),
        name: "My first theme",
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
        name: "My second theme with a longer name than usual so that we can see the shortened text in action",
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
    {
        ref: idRef("theme3"),
        name: "My third theme",
        content: {
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
        ref: idRef("theme4"),
        name: "My fourth theme",
        content: {
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
