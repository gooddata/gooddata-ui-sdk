// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

import type { IInsightDefinition } from "@gooddata/sdk-model";

import { type IAsCodeMessages, defineAsCodeDescriptor } from "../asCode/descriptor.js";
import type { ICatalogItemInsight } from "../catalogItem/types.js";
import { ObjectTypes } from "../objectType/constants.js";

import { VISUALIZATION_EDITOR_FEATURE_FLAG } from "./gate.js";
import {
    useHasInsightCodecHost,
    useInsightCodec,
    useIsVisualizationTypeEditable,
    useRequestInsightCodec,
} from "./insightCodecContext.js";
import { createCopiedInsight } from "./insightCopy.js";
import { countInsightReferences, createInsightMutationAdapter, loadInsight } from "./insightMutationPort.js";

const VISUALIZATION_DOCS_URL =
    "https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/structures/#visualisation";

const messages = defineMessages({
    createTitle: { id: "analyticsCatalog.visualization.dialog.create.title" },
    editTitle: { id: "analyticsCatalog.visualization.dialog.edit.title" },
    duplicate: { id: "analyticsCatalog.visualization.dialog.edit.duplicate" },
    createDefaultTitle: { id: "analyticsCatalog.visualization.create.defaultTitle" },
    createSuccess: { id: "analyticsCatalog.visualization.create.success" },
    updateSuccess: { id: "analyticsCatalog.visualization.update.success" },
    sectionHeader: { id: "analyticsCatalog.visualization.dialog.sectionHeader" },
    sectionHeaderTooltip: { id: "analyticsCatalog.visualization.dialog.sectionHeader.tooltip" },
    help: { id: "analyticsCatalog.visualization.dialog.help" },
    submitError: { id: "analyticsCatalog.visualization.dialog.submit.error" },
    deleteTitle: { id: "analyticsCatalog.visualization.dialog.delete.title" },
    deleteBody: { id: "analyticsCatalog.visualization.dialog.delete.body" },
    deleteSubmit: { id: "analyticsCatalog.visualization.dialog.delete.submit" },
    deleteSuccess: { id: "analyticsCatalog.visualization.delete.success" },
    deleteError: { id: "analyticsCatalog.visualization.delete.error" },
}) satisfies IAsCodeMessages;

const capabilityMessages = defineMessages({
    loadError: { id: "analyticsCatalog.visualization.load.error" },
    deleteUsageWarning: { id: "analyticsCatalog.visualization.dialog.delete.usageWarning" },
});

const actionMessages = defineMessages({
    openInAnalyticalDesigner: { id: "analyticsCatalog.visualization.actions.openInAnalyticalDesigner" },
});

function useIsInsightItemEditable(item: ICatalogItemInsight): boolean {
    return useIsVisualizationTypeEditable()(item.visualizationType);
}

/**
 * @internal
 */
export const visualizationDescriptor = defineAsCodeDescriptor<IInsightDefinition, ICatalogItemInsight>({
    objectType: ObjectTypes.VISUALIZATION,
    docsUrl: VISUALIZATION_DOCS_URL,
    featureFlag: VISUALIZATION_EDITOR_FEATURE_FLAG,
    messages,
    useEditing: useInsightCodec,
    useRequestEditing: useRequestInsightCodec,
    useIsItemEditable: useIsInsightItemEditable,
    // Without a host-injected codec the editor can never resolve, so creation falls back to Analytical Designer.
    useCreateGate: useHasInsightCodecHost,
    createMutationPort: createInsightMutationAdapter,
    emptyDefinition: (defaultTitle) => ({
        insight: {
            title: defaultTitle,
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    }),
    seed: { load: loadInsight, loadError: capabilityMessages.loadError },
    referenceCounted: {
        count: countInsightReferences,
        usageWarning: capabilityMessages.deleteUsageWarning,
    },
    // No identity: an insight definition has no id field, and creates never carry one (backend-assigned).
    toCopy: createCopiedInsight,
    openAction: actionMessages.openInAnalyticalDesigner,
});
