// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { ScrollNotificationDiv } from "./ScrollNotificationDiv";

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
