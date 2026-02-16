// (C) 2020-2026 GoodData Corporation

import { type CSSProperties, type ReactElement } from "react";

export function SmallScreenDecorator(components: ReactElement): ReactElement {
    const style: CSSProperties = {
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
}
