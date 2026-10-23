// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useMemo, useState } from "react";

export interface IExpandableTooltipContext {
    expanded: boolean;
    setExpanded: (state: boolean) => void;
    hasScrollbar: boolean;
    setHasScrollbar: (state: boolean) => void;
}

export const ExpandableTooltipContext = createContext<IExpandableTooltipContext | null>(null);

export function ExpandableTooltipContextProvider({ children }: PropsWithChildren) {
    const [expanded, setExpanded] = useState(false);
    const [hasScrollbar, setHasScrollbar] = useState(false);

    const context = useMemo<IExpandableTooltipContext>(() => {
        return {
            expanded,
            hasScrollbar,
            setExpanded,
            setHasScrollbar,
        };
    }, [expanded, hasScrollbar]);

    return <ExpandableTooltipContext.Provider value={context}>{children}</ExpandableTooltipContext.Provider>;
}
