// (C) 2025-2026 GoodData Corporation

import { type FC, type ReactNode, createContext, useContext } from "react";

import { InsightWidgetDescriptionTrigger } from "./InsightWidgetDescriptionTrigger.js";
import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";

interface IInsightWidgetDescriptionComponentContextType {
    InsightWidgetDescriptionComponent: FC<IInsightWidgetDescriptionTriggerProps>;
}

const InsightWidgetDescriptionComponentContext = createContext<
    IInsightWidgetDescriptionComponentContextType | undefined
>(undefined);

export function InsightWidgetDescriptionComponentProvider({
    InsightWidgetDescriptionComponent,
    children,
}: {
    InsightWidgetDescriptionComponent: FC<IInsightWidgetDescriptionTriggerProps>;
    children: ReactNode;
}) {
    return (
        <InsightWidgetDescriptionComponentContext.Provider value={{ InsightWidgetDescriptionComponent }}>
            {children}
        </InsightWidgetDescriptionComponentContext.Provider>
    );
}

export const useInsightWidgetDescriptionComponent = (): IInsightWidgetDescriptionComponentContextType => {
    const context = useContext(InsightWidgetDescriptionComponentContext);
    if (!context) {
        return { InsightWidgetDescriptionComponent: InsightWidgetDescriptionTrigger };
    }
    return context;
};
