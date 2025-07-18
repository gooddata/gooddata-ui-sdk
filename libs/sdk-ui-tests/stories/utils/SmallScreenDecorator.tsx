// (C) 2020-2025 GoodData Corporation
import { CSSProperties, ReactElement } from "react";

export const SmallScreenDecorator = (components: ReactElement): ReactElement => {
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
};
