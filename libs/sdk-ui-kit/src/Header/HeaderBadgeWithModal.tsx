// (C) 2021-2025 GoodData Corporation
import { ReactNode, useState } from "react";

import { HeaderBadge, IHeaderBadgeProps } from "./HeaderBadge.js";

/**
 * @internal
 */
export interface IHeaderBadgeWithModalProps extends IHeaderBadgeProps {
    renderModalContent: (parameters: { closeModal: () => void }) => ReactNode;
    children?: ReactNode;
}

/**
 * @internal
 */
export function HeaderBadgeWithModal({
    renderModalContent,
    children,
    color,
    ...badgeProps
}: IHeaderBadgeWithModalProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <HeaderBadge {...badgeProps}>
            <button
                type="button"
                style={{ color }}
                className="gd-header-badge-button"
                onClick={() => setIsModalOpen(true)}
            >
                {children}
            </button>
            {isModalOpen ? renderModalContent({ closeModal: () => setIsModalOpen(false) }) : null}
        </HeaderBadge>
    );
}
