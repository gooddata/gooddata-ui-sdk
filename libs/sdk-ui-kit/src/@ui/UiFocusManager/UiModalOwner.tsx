// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useMemo } from "react";

const MODAL_OWNER_ATTRIBUTE = "data-gd-modal-owner";

export const modalOwnerAttributes = { [MODAL_OWNER_ATTRIBUTE]: "" } as const;

const NO_OWNERS: readonly Element[] = [];

const UiModalOwnerContext = createContext<readonly Element[]>(NO_OWNERS);

export function UiModalOwnerProvider({ modal, children }: { modal: Element | null; children: ReactNode }) {
    const parentOwners = useContext(UiModalOwnerContext);
    const owners = useMemo(() => (modal ? [modal, ...parentOwners] : parentOwners), [modal, parentOwners]);
    return <UiModalOwnerContext.Provider value={owners}>{children}</UiModalOwnerContext.Provider>;
}

export function useUiModalOwners(): readonly Element[] {
    return useContext(UiModalOwnerContext);
}

export function isOwnershipAwareModal(modal: Element): boolean {
    return modal.hasAttribute(MODAL_OWNER_ATTRIBUTE);
}
