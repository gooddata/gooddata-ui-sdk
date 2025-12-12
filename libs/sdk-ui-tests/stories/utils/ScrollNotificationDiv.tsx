// (C) 2020-2025 GoodData Corporation

import { type CSSProperties, type ReactNode, memo, useCallback, useRef } from "react";

interface IScrollNotificationDiv {
    style?: CSSProperties;
    children?: ReactNode;
}

export const ScrollNotificationDiv = memo(function ScrollNotificationDiv(props: IScrollNotificationDiv) {
    const divRef = useRef<HTMLDivElement>(null);

    const onScroll = useCallback(() => {
        if (divRef) {
            const node = divRef.current;
            node?.dispatchEvent(new CustomEvent("goodstrap.scrolled", { bubbles: true }));
        }
    }, []);

    return (
        <div ref={divRef} onScroll={onScroll} style={props.style}>
            {props.children}
        </div>
    );
});
