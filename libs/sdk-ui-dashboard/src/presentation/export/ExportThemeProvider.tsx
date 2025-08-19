// (C) 2025 GoodData Corporation
import React, { ReactNode } from "react";

import { ITheme } from "@gooddata/sdk-model";
import { ScopedThemeProvider, useTheme } from "@gooddata/sdk-ui-theme-provider";

/**
 * @alpha
 */
export interface ExportThemeProviderProps {
    children: ReactNode;
}

/**
 * @alpha
 */
export function ExportThemeProvider({ children }: ExportThemeProviderProps) {
    const theme = useTheme();

    return (
        <ScopedThemeProvider theme={getTheme(theme)}>
            <div style={getWrapperStyles()}>{children}</div>
        </ScopedThemeProvider>
    );
}

const fonts = [
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevttHOmHS91ixg0.woff2)",
        unicodeRange: "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevtvXOmHS91ixg0.woff2)",
        unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevtuHOmHS91ixg0.woff2)",
        unicodeRange:
            "U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevttXOmHS91ixg0.woff2)",
        unicodeRange: "U+1F00-1FFF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevtunOmHS91ixg0.woff2)",
        unicodeRange: "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevttnOmHS91ixg0.woff2)",
        unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevtt3OmHS91ixg0.woff2)",
        unicodeRange:
            "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0ZIpQlx3QUlC5A4PNr4C5OaxRsfNNlKbCePevtuXOmHS91iw.woff2)",
        unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5aPdu3mhPy1Fig.woff2)",
        unicodeRange: "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5ardu3mhPy1Fig.woff2)",
        unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a_du3mhPy1Fig.woff2)",
        unicodeRange:
            "U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B09",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5aLdu3mhPy1Fig.woff2)",
        unicodeRange: "U+1F00-1FFF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a3du3mhPy1Fig.woff2)",
        unicodeRange: "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5aHdu3mhPy1Fig.woff2)",
        unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5aDdu3mhPy1Fig.woff2)",
        unicodeRange:
            "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a7du3mhPy0.woff2)",
        unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0OMImSLYBIv1o4X1M8cce4OdVisMz5nZRqy6cmmmU3t3NeCAAFOvV9SNjBw3uBdlEl2qOL.woff2)",
        unicodeRange: "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0OMImSLYBIv1o4X1M8cce4OdVisMz5nZRqy6cmmmU3t3NeCAAFOvV9SNjBynuBdlEl2qOL.woff2)",
        unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0OMImSLYBIv1o4X1M8cce4OdVisMz5nZRqy6cmmmU3t3NeCAAFOvV9SNjBwXuBdlEl2qOL.woff2)",
        unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0OMImSLYBIv1o4X1M8cce4OdVisMz5nZRqy6cmmmU3t3NeCAAFOvV9SNjBwHuBdlEl2qOL.woff2)",
        unicodeRange:
            "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0OMImSLYBIv1o4X1M8cce4OdVisMz5nZRqy6cmmmU3t3NeCAAFOvV9SNjBznuBdlEl2g.woff2)",
        unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJDxzHGGVFMV2w.woff2)",
        unicodeRange: "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJnxzHGGVFMV2w.woff2)",
        unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJLxzHGGVFMV2w.woff2)",
        unicodeRange:
            "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJPxzHGGVFMV2w.woff2)",
        unicodeRange:
            "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
    {
        font: "url(https://fonts.gstatic.com/s/nunitosans/v15/pe0AMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfUVwoNnq4CLz0_kJ3xzHGGVFM.woff2)",
        unicodeRange:
            "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
];

function getWrapperStyles() {
    return {
        fontFamily: "var(--gd-font-family)",
    };
}

function getTheme(theme: ITheme | undefined) {
    return {
        ...theme,
        typography: {
            font: fonts,
            fontBold: fonts,
        },
    };
}
