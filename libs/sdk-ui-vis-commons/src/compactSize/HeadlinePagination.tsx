// (C) 2021-2025 GoodData Corporation
import React, { ReactElement, useState } from "react";

import { HeadlinePaginationRenderer } from "./HeadlinePaginationRenderer.js";

/**
 * @internal
 */
export interface IHeadlinePaginationProps {
    renderSecondaryItem: () => ReactElement;
    renderTertiaryItem: () => ReactElement;
    accessibilityConfig?: {
        nextAriaLabel?: string;
        previousAriaLabel?: string;
    };
}

/**
 * @internal
 */
export const HeadlinePagination: React.FC<IHeadlinePaginationProps> = ({
    renderSecondaryItem,
    renderTertiaryItem,
    accessibilityConfig,
}) => {
    const { nextAriaLabel, previousAriaLabel } = accessibilityConfig ?? {};
    const [item, setItem] = useState<number>(1);

    const showNextItem = (): void => setItem(item + 1);

    const showPrevItem = (): void => setItem(item - 1);

    return (
        <>
            <HeadlinePaginationRenderer
                item={item}
                showNextItem={showNextItem}
                showPrevItem={showPrevItem}
                accessibilityConfig={{
                    nextAriaLabel,
                    previousAriaLabel,
                }}
            />
            {item === 1 && renderSecondaryItem()}
            {item === 2 && renderTertiaryItem()}
        </>
    );
};
