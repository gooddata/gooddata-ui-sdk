// (C) 2026 GoodData Corporation

import { Suspense, lazy, useCallback, useMemo } from "react";

import { defineMessages } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { createCopiedParameter, createCopiedParameterCatalogItem } from "./parameterCopy.js";
import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { convertParameterToCatalogItem } from "../catalogItem/converter.js";
import { type ICatalogItemParameter } from "../catalogItem/types.js";

const ParameterDialog = lazy(() =>
    import("./ParameterDialog.js").then((m) => ({ default: m.ParameterDialog })),
);

const messages = defineMessages({
    parameterCreateSuccess: { id: "analyticsCatalog.parameter.create.success" },
});

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    item: ICatalogItemParameter;
    onClose: () => void;
    onSaved: (item: ICatalogItemParameter) => void;
};

export function ParameterDuplicateDialog({ backend, workspace, item, onClose, onSaved }: Props) {
    const { addSuccess } = useToastMessage();
    const { refetchObjectType } = useCatalogFeedActions();

    const initialParameter = useMemo(
        () =>
            createCopiedParameter({
                id: item.identifier,
                type: "parameter",
                title: item.title,
                description: item.description,
                tags: item.tags,
                definition: item.definition,
            }),
        [item],
    );

    const handleSubmit = useCallback(
        async (parameter: IParameterMetadataObjectDefinition) => {
            const savedParameter = await createCopiedParameterCatalogItem(
                backend,
                workspace,
                parameter,
                initialParameter.id,
            );
            const nextParameter = convertParameterToCatalogItem(savedParameter);
            onSaved(nextParameter);
            onClose();
            addSuccess(messages.parameterCreateSuccess);
            await refetchObjectType("parameter");
        },
        [addSuccess, backend, initialParameter.id, onClose, onSaved, refetchObjectType, workspace],
    );

    return (
        <Suspense fallback={null}>
            <ParameterDialog
                mode="create"
                initialParameter={initialParameter}
                onClose={onClose}
                onSubmit={handleSubmit}
            />
        </Suspense>
    );
}
