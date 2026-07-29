// (C) 2026 GoodData Corporation

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IInsightDefinition, idRef, isInsight } from "@gooddata/sdk-model";

import type { IAsCodeMutationPort } from "../asCode/descriptor.js";
import type { ServerIdentity } from "../asCode/serverIdentity.js";
import { convertInsightToCatalogItem } from "../catalogItem/converter.js";
import type { ICatalogItemInsight } from "../catalogItem/types.js";

/** @internal */
export type IInsightMutationPort = IAsCodeMutationPort<IInsightDefinition, ICatalogItemInsight>;

/** Fetches the full insight for editing (the catalog item carries only metadata). @internal */
export function loadInsight(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemInsight,
): Promise<IInsightDefinition> {
    // loadUserData so the base carries createdBy/updatedBy: updateInsight echoes its input rather than
    // the server response, so without them the saved catalog item shows blank authors.
    return backend
        .workspace(workspace)
        .insights()
        .getInsight(idRef(item.identifier, "insight"), { loadUserData: true });
}

/** Counts the dashboards referencing an insight. @internal */
export async function countInsightReferences(
    backend: IAnalyticalBackend,
    workspace: string,
    item: ICatalogItemInsight,
): Promise<number> {
    const referencing = await backend
        .workspace(workspace)
        .insights()
        .getInsightReferencingObjects(idRef(item.identifier, "insight"));
    return referencing.analyticalDashboards?.length ?? 0;
}

function pickInsightIdentity(
    insight: IInsight["insight"],
): ServerIdentity<IInsight["insight"], IInsightDefinition["insight"]> {
    const { identifier, uri, ref, isLocked, certification } = insight;
    const { created, updated, createdBy, updatedBy } = insight;
    return {
        identifier,
        uri,
        ref,
        isLocked,
        certification,
        created,
        updated,
        createdBy,
        updatedBy,
    };
}

/** @internal */
export function createInsightMutationAdapter(
    backend: IAnalyticalBackend,
    workspace: string,
): IInsightMutationPort {
    const insights = () => backend.workspace(workspace).insights();
    return {
        async create(definition) {
            return convertInsightToCatalogItem(await insights().createInsight(definition));
        },
        async update(base, definition) {
            if (!isInsight(base) || !base.insight.identifier) {
                throw new Error("Visualization update requires the loaded insight as base.");
            }
            // Definition is authoritative for content (already reconciled); re-attach only identity — a
            // base overlay would revert a field the editor cleared.
            const saved = await insights().updateInsight({
                ...base,
                insight: { ...definition.insight, ...pickInsightIdentity(base.insight) },
            });
            return convertInsightToCatalogItem(saved);
        },
        async delete(ref) {
            await insights().deleteInsight(idRef(ref.identifier, "insight"));
        },
    };
}
