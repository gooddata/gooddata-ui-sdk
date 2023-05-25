// (C) 2021 GoodData Corporation
import React, { useState } from "react";

import { HeadlinePaginationRenderer } from "./HeadlinePaginationRenderer.js";

/**
 * @internal
 */
export interface IHeadlinePaginationProps {
    renderSecondaryItem: () => JSX.Element;
    renderTertiaryItem: () => JSX.Element;
}

/**
 * @internal
 */
export const HeadlinePagination: React.FC<IHeadlinePaginationProps> = ({
    renderSecondaryItem,
    renderTertiaryItem,
}) => {
    const [item, setItem] = useState<number>(1);

    const showNextItem = (): void => setItem(item + 1);

    const showPrevItem = (): void => setItem(item - 1);

    return (
        <>
            <HeadlinePaginationRenderer item={item} showNextItem={showNextItem} showPrevItem={showPrevItem} />
            {item === 1 && renderSecondaryItem()}
            {item === 2 && renderTertiaryItem()}
        </>
    );
};
