// (C) 2025 GoodData Corporation

import React, { createContext, useContext, ReactNode } from "react";
import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { InsightWidgetDescriptionTrigger } from "./InsightWidgetDescriptionTrigger.js";

interface InsightWidgetDescriptionComponentContextType {
    InsightWidgetDescriptionComponent: React.FC<IInsightWidgetDescriptionTriggerProps>;
}

const InsightWidgetDescriptionComponentContext = createContext<
    InsightWidgetDescriptionComponentContextType | undefined
>(undefined);

export const InsightWidgetDescriptionComponentProvider: React.FC<{
    InsightWidgetDescriptionComponent: React.FC<IInsightWidgetDescriptionTriggerProps>;
    children: ReactNode;
}> = ({ InsightWidgetDescriptionComponent, children }) => {
    return (
        <InsightWidgetDescriptionComponentContext.Provider value={{ InsightWidgetDescriptionComponent }}>
            {children}
        </InsightWidgetDescriptionComponentContext.Provider>
    );
};

export const useInsightWidgetDescriptionComponent = (): InsightWidgetDescriptionComponentContextType => {
    const context = useContext(InsightWidgetDescriptionComponentContext);
    if (!context) {
        return { InsightWidgetDescriptionComponent: InsightWidgetDescriptionTrigger };
    }
    return context;
};
