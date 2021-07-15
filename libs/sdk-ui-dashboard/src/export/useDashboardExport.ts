// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { useDashboardCommand } from "../model";
import { requestAsyncRenderForExport, resolveAsyncRenderForExport } from "../model/commands/export";

export interface UseDashboardExportAsyncRenderProps {
    /**
     * Callback that requests dashboard export async render
     * with id provided to the {@link useDashboardExportAsyncRender} hook.
     */
    onRequestAsyncRender: () => void;

    /**
     * Callback that resolves dashboard export async render
     * with id provided to the {@link useDashboardExportAsyncRender} hook.
     */
    onResolveAsyncRender: () => void;
}
/**
 * @internal
 */
export const useDashboardExportAsyncRender = (id: string): UseDashboardExportAsyncRenderProps => {
    const requestDashboardAsyncRenderForExport = useDashboardCommand(requestAsyncRenderForExport);
    const resolveDashboardAsyncRenderForExport = useDashboardCommand(resolveAsyncRenderForExport);

    const onRequestAsyncRender = useCallback(() => {
        requestDashboardAsyncRenderForExport(id);
    }, [id]);

    const onResolveAsyncRender = useCallback(() => {
        resolveDashboardAsyncRenderForExport(id);
    }, [id]);

    return {
        onRequestAsyncRender,
        onResolveAsyncRender,
    };
};
