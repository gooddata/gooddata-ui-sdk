// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IExportTemplate, objRefToString } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { selectEnableExportTemplateSelection } from "../store/config/configSelectors.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Fetches export templates when the feature flag is enabled.
 * Returns an empty array when disabled or while loading.
 *
 * Fetches from both scopes and merges them: workspace-level templates (including any inherited from
 * a parent workspace) and organization-level templates. Templates are deduplicated by ref — on a
 * collision the workspace copy wins, as the more specific scope. Each scope is read independently:
 * if one scope cannot be read (e.g. the user lacks organization-level permissions), the hook
 * degrades to the other scope rather than failing the whole export flow.
 *
 * The backend caching layer deduplicates redundant calls across hook instances for both scopes.
 *
 * @internal
 */
export function useExportTemplates(): IExportTemplate[] {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const isEnabled = useDashboardSelector(selectEnableExportTemplateSelection);

    const { result } = useCancelablePromise(
        {
            promise: isEnabled
                ? async () => {
                      const [workspaceTemplates, orgTemplates] = await Promise.all([
                          loadWorkspaceTemplates(backend, workspace),
                          loadOrgTemplates(backend),
                      ]);
                      return mergeExportTemplates(workspaceTemplates, orgTemplates);
                  }
                : () => Promise.resolve([] as IExportTemplate[]),
        },
        [backend, workspace, isEnabled],
    );

    return result ?? [];
}

/**
 * Loads workspace-level export templates, degrading to an empty list if the workspace scope cannot
 * be read so that organization templates (loaded in parallel) are still offered.
 */
async function loadWorkspaceTemplates(
    backend: IAnalyticalBackend,
    workspace: string,
): Promise<IExportTemplate[]> {
    return backend
        .workspace(workspace)
        .exportTemplates()
        .getExportTemplates()
        .catch(() => []);
}

/**
 * Loads organization-level export templates, degrading to an empty list if the organization scope
 * cannot be read (e.g. missing org-level permissions) so that workspace templates (loaded in
 * parallel) are still offered.
 */
async function loadOrgTemplates(backend: IAnalyticalBackend): Promise<IExportTemplate[]> {
    return backend
        .organizations()
        .getCurrentOrganization()
        .then((org) => org.exportTemplates().getExportTemplates())
        .catch(() => []);
}

/**
 * Merges workspace and organization templates into a single list, deduplicated by ref. Workspace
 * templates take precedence and are listed first, as the more specific scope.
 */
function mergeExportTemplates(
    workspaceTemplates: IExportTemplate[],
    orgTemplates: IExportTemplate[],
): IExportTemplate[] {
    const seen = new Set(workspaceTemplates.map((template) => objRefToString(template.ref)));
    return [
        ...workspaceTemplates,
        ...orgTemplates.filter((template) => !seen.has(objRefToString(template.ref))),
    ];
}
