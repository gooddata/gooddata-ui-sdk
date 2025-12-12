// (C) 2025 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

export const useInsightPositionStyle = () => {
    const insightPositionStyle: CSSProperties = useMemo(() => {
        return {
            width: "100%",
            height: "100%",
            // Headline violates the layout contract.
            // It should fit parent height and adapt to it as other visualizations.
            // Now, it works differently for the Headline - parent container adapts to Headline size.
            position: "absolute",
        };
    }, []);

    return insightPositionStyle;
};
