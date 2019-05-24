// (C) 2007-2019 GoodData Corporation
import * as React from "react";

export const SmallScreenDecorator = (components: JSX.Element): JSX.Element => {
    const style: React.CSSProperties = {
        width: 600,
        height: 400,
        padding: 20,
        borderStyle: "solid",
        borderWidth: "1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };
    return (
        <div style={style}>
            <div>{components}</div>
        </div>
    );
};
