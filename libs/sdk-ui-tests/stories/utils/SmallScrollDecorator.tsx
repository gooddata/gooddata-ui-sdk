// (C) 2020 GoodData Corporation
import React from "react";
import { ScrollNotificationDiv } from "./ScrollNotificationDiv.js";

export const SmallScrollDecorator = (width: number, height: number, components: JSX.Element): JSX.Element => {
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
