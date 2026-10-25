// (C) 2007-2026 GoodData Corporation

import { type ReactNode, memo, useCallback } from "react";

import classNames from "classnames";

import { simplifyText } from "@gooddata/util";

interface IFilterItemProps {
    identifier: string;
    className?: string;
    children: ReactNode;
}

export const FilterItem = memo(function FilterItem({ identifier, className, children }: IFilterItemProps) {
    const getClassNames = useCallback(() => {
        const simplifiedIdentifier = simplifyText(identifier);

        return classNames(
            ["adi-bucket-item", "adi-filter-item-wrapper", "s-bucket-item", "s-attr-filter"],
            `s-id-${simplifiedIdentifier}`,
            className,
        );
    }, [identifier, className]);

    return <div className={getClassNames()}>{children}</div>;
});
