// (C) 2025 GoodData Corporation

import { createContext, useContext, ReactNode, ComponentType } from "react";
import { IInsightWidgetDescriptionTriggerProps } from "./types.js";
import { InsightWidgetDescriptionTrigger } from "./InsightWidgetDescriptionTrigger.js";

interface InsightWidgetDescriptionComponentContextType {
    InsightWidgetDescriptionComponent: ComponentType<IInsightWidgetDescriptionTriggerProps>;
}

const InsightWidgetDescriptionComponentContext = createContext<
    InsightWidgetDescriptionComponentContextType | undefined
>(undefined);

export function InsightWidgetDescriptionComponentProvider({
    InsightWidgetDescriptionComponent,
    children,
}: {
    InsightWidgetDescriptionComponent: ComponentType<IInsightWidgetDescriptionTriggerProps>;
    children: ReactNode;
}) {
    return (
        <InsightWidgetDescriptionComponentContext.Provider value={{ InsightWidgetDescriptionComponent }}>
            {children}
        </InsightWidgetDescriptionComponentContext.Provider>
    );
}

export const useInsightWidgetDescriptionComponent = (): InsightWidgetDescriptionComponentContextType => {
    const context = useContext(InsightWidgetDescriptionComponentContext);
    if (!context) {
        return { InsightWidgetDescriptionComponent: InsightWidgetDescriptionTrigger };
    }
    return context;
};
