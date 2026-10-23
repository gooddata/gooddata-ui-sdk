// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { Bubble } from "@gooddata/sdk-ui-kit";

export interface IEditableRowErrorProps {
    showError?: boolean;
    errorMessage?: ReactElement | string;
    showWarning?: boolean;
    warningMessage?: ReactElement | string;
    errorId?: string;
    alignTo?: HTMLElement | null;
    align?: string;
    warningId?: string;
}

export function EditableRowError({
    showError,
    errorMessage,
    showWarning,
    warningMessage,
    errorId,
    warningId,
    alignTo,
    align = "bc tc",
}: IEditableRowErrorProps) {
    return (
        <>
            {showError && errorMessage && (
                <Bubble
                    id={errorId}
                    className="bubble-negative s-editable-row-error"
                    alignTo={alignTo}
                    alignPoints={[{ align }]}
                >
                    {errorMessage}
                </Bubble>
            )}
            {showWarning && warningMessage && !showError && (
                <Bubble
                    id={warningId}
                    className="bubble-warning s-editable-row-warning"
                    alignTo={alignTo}
                    alignPoints={[{ align }]}
                >
                    {warningMessage}
                </Bubble>
            )}
        </>
    );
}
