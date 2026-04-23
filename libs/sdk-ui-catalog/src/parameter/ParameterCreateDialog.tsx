// (C) 2026 GoodData Corporation

import { Suspense, lazy, useCallback, useMemo } from "react";

import { defineMessages } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemParameter } from "../catalogItem/types.js";
import { createCopiedParameter, isDuplicateIdError } from "./parameterCopy.js";
import type { ParameterDialogInitialParameter } from "./ParameterDialog.js";
import { useParameterMutation } from "./ParameterMutationContext.js";

const ParameterDialog = lazy(() =>
    import("./ParameterDialog.js").then((m) => ({ default: m.ParameterDialog })),
);

const messages = defineMessages({
    parameterCreateSuccess: { id: "analyticsCatalog.parameter.create.success" },
});

const defaultInitialParameter: ParameterDialogInitialParameter = {
    title: "My Parameter",
    description: "",
    definition: {
        type: "NUMBER",
        defaultValue: 0,
    },
};

type Props = {
    sourceItem?: ICatalogItemParameter;
    onClose: () => void;
    onCreated?: (item: ICatalogItemParameter) => void;
};

export function ParameterCreateDialog({ sourceItem, onClose, onCreated }: Props) {
    const { addSuccess } = useToastMessage();
    const mutation = useParameterMutation();

    const initialParameter = useMemo<ParameterDialogInitialParameter>(() => {
        if (!sourceItem) {
            return defaultInitialParameter;
        }
        return createCopiedParameter({
            id: sourceItem.identifier,
            type: "parameter",
            title: sourceItem.title,
            description: sourceItem.description,
            tags: sourceItem.tags,
            definition: sourceItem.definition,
        });
    }, [sourceItem]);

    const copiedId = sourceItem ? initialParameter.id : undefined;

    const handleSubmit = useCallback(
        async (parameter: IParameterMetadataObjectDefinition) => {
            let createdParameter: ICatalogItemParameter;
            try {
                createdParameter = await mutation.create(parameter);
            } catch (error) {
                if (copiedId !== undefined && parameter.id === copiedId && isDuplicateIdError(error)) {
                    const { id: _id, ...parameterWithoutId } = parameter;
                    createdParameter = await mutation.create(parameterWithoutId);
                } else {
                    throw error;
                }
            }
            onCreated?.(createdParameter);
            onClose();
            addSuccess(messages.parameterCreateSuccess);
        },
        [addSuccess, copiedId, mutation, onClose, onCreated],
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
