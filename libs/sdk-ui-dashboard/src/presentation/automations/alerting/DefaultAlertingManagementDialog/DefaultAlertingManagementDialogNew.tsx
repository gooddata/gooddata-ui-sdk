// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IAlertingManagementDialogProps } from "../types.js";

import { DefaultAlertingManagementDialogContent } from "./DefaultAlertingManagementDialogContent.js";

/**
 * @alpha
 */
export function DefaultAlertingManagementDialogNew({
    onEdit,
    onAdd,
    onClose,
}: IAlertingManagementDialogProps) {
    const handleAlertEdit = useCallback(
        (alert: IAutomationMetadataObject) => {
            onEdit?.(alert);
        },
        [onEdit],
    );

    return (
        <DefaultAlertingManagementDialogContent onAdd={onAdd} onClose={onClose} onEdit={handleAlertEdit} />
    );
}
