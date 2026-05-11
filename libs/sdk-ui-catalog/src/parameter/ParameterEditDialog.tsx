// (C) 2026 GoodData Corporation

import { Suspense, lazy, useCallback } from "react";

import { defineMessages } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { type ICatalogItemParameter } from "../catalogItem/types.js";

import { useParameterMutation } from "./ParameterMutationContext.js";

const ParameterDialog = lazy(() =>
    import("./ParameterDialog.js").then((m) => ({ default: m.ParameterDialog })),
);

const messages = defineMessages({
    parameterUpdateSuccess: { id: "analyticsCatalog.parameter.update.success" },
});

type Props = {
    item: ICatalogItemParameter;
    onClose: () => void;
    onSaved: (item: ICatalogItemParameter) => void;
    onDuplicate?: (parameter: IParameterMetadataObjectDefinition) => void;
};

export function ParameterEditDialog({ item, onClose, onSaved, onDuplicate }: Props) {
    const { addSuccess } = useToastMessage();
    const mutation = useParameterMutation();

    const handleSubmit = useCallback(
        async (parameter: IParameterMetadataObjectDefinition) => {
            const savedParameter = await mutation.update({
                ...item,
                title: parameter.title ?? item.title,
                description: parameter.description ?? item.description,
                tags: parameter.tags ?? item.tags,
                definition: parameter.definition,
                updatedAt: new Date(),
            });
            onSaved(savedParameter);
            onClose();
            addSuccess(messages.parameterUpdateSuccess);
        },
        [addSuccess, item, mutation, onClose, onSaved],
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
