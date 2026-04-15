// (C) 2026 GoodData Corporation

import { Suspense, lazy, useCallback } from "react";

import { defineMessages } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { convertParameterToCatalogItem } from "../catalogItem/converter.js";
import { updateParameterCatalogItem } from "../catalogItem/query.js";
import { type ICatalogItemParameter } from "../catalogItem/types.js";

const ParameterDialog = lazy(() =>
    import("./ParameterDialog.js").then((m) => ({ default: m.ParameterDialog })),
);

const messages = defineMessages({
    parameterUpdateSuccess: { id: "analyticsCatalog.parameter.update.success" },
});

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    item: ICatalogItemParameter;
    onClose: () => void;
    onSaved: (item: ICatalogItemParameter) => void;
    onDuplicate: (parameter: IParameterMetadataObjectDefinition) => void;
};

export function ParameterEditDialog({ backend, workspace, item, onClose, onSaved, onDuplicate }: Props) {
    const { addSuccess } = useToastMessage();
    const { refetchObjectType } = useCatalogFeedActions();

    const handleSubmit = useCallback(
        async (parameter: IParameterMetadataObjectDefinition) => {
            const savedParameter = await updateParameterCatalogItem(backend, workspace, {
                ...item,
                title: parameter.title ?? item.title,
                description: parameter.description ?? item.description,
                tags: parameter.tags ?? item.tags,
                definition: parameter.definition,
                updatedAt: new Date(),
            });
            const nextParameter = convertParameterToCatalogItem(savedParameter);
            onSaved(nextParameter);
            onClose();
            addSuccess(messages.parameterUpdateSuccess);
            await refetchObjectType("parameter");
        },
        [addSuccess, backend, item, onClose, onSaved, refetchObjectType, workspace],
    );

    return (
        <Suspense fallback={null}>
            <ParameterDialog
                mode="edit"
                initialParameter={{
                    id: item.identifier,
                    title: item.title,
                    description: item.description,
                    definition: item.definition,
                    tags: item.tags,
                }}
                onClose={onClose}
                onSubmit={handleSubmit}
                onDuplicate={onDuplicate}
            />
        </Suspense>
    );
}
