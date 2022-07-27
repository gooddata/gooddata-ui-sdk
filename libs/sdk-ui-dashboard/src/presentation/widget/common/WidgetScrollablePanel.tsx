// (C) 2022 GoodData Corporation
import React from "react";
import debounce from "lodash/debounce";

import { ScrollablePanel } from "./configuration/ScrollablePanel";

interface IWidgetScrollablePanelProps {
    className: string;
}

export const WidgetScrollablePanel: React.FC<IWidgetScrollablePanelProps> = ({ className, children }) => {
    const node = React.createRef<HTMLDivElement>();

    const isNotOnInput = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        return target.tagName !== "INPUT";
    };

    const onScroll = debounce(() => {
        if (node?.current) {
            // fireGoodstrapScrollEvent(node.current, window); // TODO: what should this do?
        }
    }, 20);

    const onPanelScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (isNotOnInput(event)) {
            onScroll();
        }
    };

    return (
        <ScrollablePanel className={className} ref={node} onScroll={onPanelScroll}>
            {children}
        </ScrollablePanel>
    );
};
