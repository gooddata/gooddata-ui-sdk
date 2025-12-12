// (C) 2025 GoodData Corporation

import { type FC, type ReactNode, createContext, useContext } from "react";

import { InsightWidgetDescriptionTrigger } from "./InsightWidgetDescriptionTrigger.js";
import { type IInsightWidgetDescriptionTriggerProps } from "./types.js";

interface InsightWidgetDescriptionComponentContextType {
    InsightWidgetDescriptionComponent: FC<IInsightWidgetDescriptionTriggerProps>;
}

const InsightWidgetDescriptionComponentContext = createContext<
    InsightWidgetDescriptionComponentContextType | undefined
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

export const useInsightWidgetDescriptionComponent = (): InsightWidgetDescriptionComponentContextType => {
    const context = useContext(InsightWidgetDescriptionComponentContext);
    if (!context) {
        return { InsightWidgetDescriptionComponent: InsightWidgetDescriptionTrigger };
    }
    return context;
};
