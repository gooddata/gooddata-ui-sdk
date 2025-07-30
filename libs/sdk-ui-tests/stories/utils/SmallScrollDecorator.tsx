// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { ScrollNotificationDiv } from "./ScrollNotificationDiv.js";

export const SmallScrollDecorator = (
    width: number,
    height: number,
    components: ReactElement,
): ReactElement => {
    const style: React.CSSProperties = {
        overflow: "scroll",
        width,
        height,
        padding: 20,
        borderStyle: "solid",
        borderWidth: "1px",
    };

    return <ScrollNotificationDiv style={style}>{components}</ScrollNotificationDiv>;
};
