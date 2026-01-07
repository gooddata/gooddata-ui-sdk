// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { v4 as uuid } from "uuid";

import type { ISeparators } from "@gooddata/sdk-model";

import { KdaProvider } from "../providers/Kda.js";
import type { IKdaDefinition, IKdaDialogProps } from "../types.js";
import { KdaDialog } from "./KdaDialog.js";
import { KdaDialogArbiter } from "./KdaDialogArbiter.js";
import { KdaReplaceConfirmationDialog } from "./KdaReplaceConfirmationDialog.js";

const arbiter = KdaDialogArbiter.getInstance();

export interface IKdaDialogControllerProps extends IKdaDialogProps {
    separators?: ISeparators;
    /**
     * Latest requested definition. When a dialog is already open and this differs from the active definition,
     * confirmation is shown before the active definition is replaced.
     */
    requestedDefinition?: IKdaDefinition;
    /**
     * Optional callback allowing the controller to sync the host's requested definition.
     * Used to revert the host back to active definition on "Stay" and to clear it on close.
     */
    onRequestedDefinitionChange?: (definition?: IKdaDefinition) => void;
}

export function KdaDialogController({
    requestedDefinition,
    separators,
    onRequestedDefinitionChange,
    ...dialogProps
}: IKdaDialogControllerProps) {
    const [activeDefinition, setActiveDefinition] = useState<IKdaDefinition | undefined>(undefined);
    const [pendingDefinition, setPendingDefinition] = useState<IKdaDefinition | undefined>(undefined);

    const isReplaceConfirmationOpen = !!pendingDefinition;

    const [ownerId] = useState(() => uuid());

    const handleDelegatedOpen = useCallback(
        (definition: IKdaDefinition) => {
            onRequestedDefinitionChange?.(definition);
        },
        [onRequestedDefinitionChange],
    );

    useEffect(() => {
        return arbiter.registerOwner(ownerId, handleDelegatedOpen);
    }, [ownerId, handleDelegatedOpen]);

    useEffect(() => {
        if (!requestedDefinition) {
            setActiveDefinition(undefined);
            setPendingDefinition(undefined);
            arbiter.release(ownerId);
            return;
        }
        if (!activeDefinition) {
            const granted = arbiter.requestOpen(ownerId, requestedDefinition);
            if (!granted) {
                // Request delegated to another active controller. Clear the host request to avoid re-trigger loops.
                onRequestedDefinitionChange?.(undefined);
                return;
            }
            setActiveDefinition(requestedDefinition);
            return;
        }
        // Whenever a dialog is already open and a *different* request arrives, always ask for confirmation.
        // This prevents showing confirmation immediately on the initial open (where active === requested).
        if (!pendingDefinition && requestedDefinition !== activeDefinition) {
            setPendingDefinition(requestedDefinition);
        }
    }, [activeDefinition, ownerId, onRequestedDefinitionChange, pendingDefinition, requestedDefinition]);

    const onCloseInternal = useCallback(() => {
        setActiveDefinition(undefined);
        setPendingDefinition(undefined);
        arbiter.release(ownerId);
        onRequestedDefinitionChange?.(undefined);
        dialogProps.onClose?.();
    }, [dialogProps, ownerId, onRequestedDefinitionChange]);

    const onCancelReplace = useCallback(() => {
        setPendingDefinition(undefined);
        if (activeDefinition) {
            onRequestedDefinitionChange?.(activeDefinition);
        }
    }, [activeDefinition, onRequestedDefinitionChange]);

    const onConfirmReplace = useCallback(() => {
        if (!pendingDefinition) {
            return;
        }
        setActiveDefinition(pendingDefinition);
        setPendingDefinition(undefined);
        onRequestedDefinitionChange?.(pendingDefinition);
    }, [onRequestedDefinitionChange, pendingDefinition]);

    if (!activeDefinition) {
        return null;
    }

    return (
        <>
            <KdaReplaceConfirmationDialog
                isOpen={isReplaceConfirmationOpen}
                onCancel={onCancelReplace}
                onConfirm={onConfirmReplace}
            />
            <KdaProvider definition={activeDefinition} separators={separators}>
                <KdaDialog {...dialogProps} onClose={onCloseInternal} />
            </KdaProvider>
        </>
    );
}
