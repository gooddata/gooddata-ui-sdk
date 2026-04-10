// (C) 2026 GoodData Corporation

import { Suspense, lazy } from "react";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import type { ParameterDialogInitialParameter } from "./ParameterDialog.js";

const ParameterDialog = lazy(() =>
    import("./ParameterDialog.js").then((m) => ({ default: m.ParameterDialog })),
);

const initialParameter: ParameterDialogInitialParameter = {
    title: "My Parameter",
    description: "",
    definition: {
        type: "NUMBER",
        defaultValue: 0,
    },
};

type Props = {
    onClose: () => void;
    onSubmit: (parameter: IParameterMetadataObjectDefinition) => Promise<void>;
};

export function ParameterCreateDialog({ onClose, onSubmit }: Props) {
    return (
        <Suspense fallback={null}>
            <ParameterDialog
                mode="create"
                initialParameter={initialParameter}
                onClose={onClose}
                onSubmit={onSubmit}
            />
        </Suspense>
    );
}
