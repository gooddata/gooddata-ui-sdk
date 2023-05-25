// (C) 2021 GoodData Corporation
import React, { useState } from "react";

import { HeaderBadge, IHeaderBadgeProps } from "./HeaderBadge.js";

/**
 * @internal
 */
export interface IHeaderBadgeWithModalProps extends IHeaderBadgeProps {
    renderModalContent: (parameters: { closeModal: () => void }) => React.ReactNode;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const HeaderBadgeWithModal: React.FC<IHeaderBadgeWithModalProps> = ({
    renderModalContent,
    children,
    color,
    ...badgeProps
}) => {
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
};
