// (C) 2021-2025 GoodData Corporation

import { Typography } from "@gooddata/sdk-ui-kit";

import { TitleWrapper } from "./TitleWrapper.js";
import { type ITitleProps } from "./types.js";

/**
 * @alpha
 */
export function DefaultTitle({ title }: ITitleProps) {
    return (
        <TitleWrapper>
            <Typography tagName="h1" className={"s-gd-dashboard-title s-dash-title dash-title static"}>
                {title}
            </Typography>
        </TitleWrapper>
    );
}
