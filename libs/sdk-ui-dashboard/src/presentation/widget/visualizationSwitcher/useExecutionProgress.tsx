// (C) 2024-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type RequestAsyncRender, type ResolveAsyncRender } from "../../../model/commands/render.js";
import { type DashboardEventHandler } from "../../../model/eventHandlers/eventHandler.js";
import { isDashboardFilterContextChanged } from "../../../model/events/filters.js";
import { type IDashboardCommandStarted, isDashboardCommandStarted } from "../../../model/events/general.js";
import { useDashboardEventsContext } from "../../../model/react/DashboardEventsContext.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsDashboardExecuted } from "../../../model/store/executed/executedSelectors.js";

export const useExecutionProgress = (): {
    showOthers: boolean;
} => {
    const isDashboardExecuted = useDashboardSelector(selectIsDashboardExecuted);
    const [isReexecuting, setIsReexecuting] = useState(true); // execution running as default because it covers the initial render and mode switching

    const [_executionsProgress, setExecutionsProgress] = useState({});

    const { registerHandler, unregisterHandler } = useDashboardEventsContext();

    useEffect(() => {
        const onActionTriggeringReexecution: DashboardEventHandler = {
            eval: (evt: any) => {
                return isDashboardFilterContextChanged(evt);
            },
            handler: () => {
                setIsReexecuting(true);
            },
        };
        const onRenderRequest: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    isDashboardCommandStarted(evt) &&
                    evt.payload.command.type === "GDC.DASH/CMD.RENDER.ASYNC.REQUEST"
                );
            },
            handler: (evt: IDashboardCommandStarted<RequestAsyncRender>) => {
                setExecutionsProgress((prev) => ({
                    ...prev,
                    [evt.payload.command.payload.id]: true,
                }));
            },
        };

        const onRenderResponse: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    isDashboardCommandStarted(evt) &&
                    evt.payload.command.type === "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE"
                );
            },
            handler: (evt: IDashboardCommandStarted<ResolveAsyncRender>) => {
                setExecutionsProgress((prev) => {
                    const newProgress = {
                        ...prev,
                        [evt.payload.command.payload.id]: false,
                    };

                    if (Object.values(newProgress).every((value) => !value)) {
                        setIsReexecuting(false);
                    }
                    return newProgress;
                });
            },
        };

        registerHandler(onActionTriggeringReexecution);
        registerHandler(onRenderRequest);
        registerHandler(onRenderResponse);

        return () => {
            unregisterHandler(onActionTriggeringReexecution);
            unregisterHandler(onRenderRequest);
            unregisterHandler(onRenderResponse);
        };
    }, [registerHandler, unregisterHandler]);

    const showOthers = isDashboardExecuted && !isReexecuting;
    return { showOthers };
};
