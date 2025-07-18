// (C) 2021-2025 GoodData Corporation

import { TitleWrapper } from "./TitleWrapper.js";
import { ITitleProps } from "./types.js";
import { Typography } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export function DefaultTitle(props: ITitleProps) {
    const { title } = props;

    return (
        <TitleWrapper>
            <Typography tagName="h1" className={"s-gd-dashboard-title s-dash-title dash-title static"}>
                {title}
            </Typography>
        </TitleWrapper>
    );
}
