// (C) 2019-2026 GoodData Corporation

import { useCallback } from "react";

import classNames from "classnames";

import { getCssClass } from "../../utils/css_class.js";

import { Spinner } from "./blocks/Spinner.js";

export interface ICatalogGroupProps {
    name: string;
    id: string;
    isExpanded: boolean;
    isLoading: boolean;
    onClick: (groupId: string) => void;
}

export function CatalogGroup({ name, id, isExpanded, isLoading, onClick }: ICatalogGroupProps) {
    const wrapperClasses = classNames(
        "adi-catalog-group",
        "s-catalog-group",
        getCssClass(name, "s-catalog-group-"),
    );
    const labelClasses = classNames("adi-catalog-group-label", "s-catalog-group-label", {
        expanded: isExpanded,
        "s-is-expanded": isExpanded,
    });

    const handleClick = useCallback(() => onClick(id), [onClick, id]);

    return (
        <div className={wrapperClasses}>
            <div className={labelClasses} onClick={handleClick} title={name}>
                <span>{name}</span>
            </div>
            {isExpanded ? (
                <div className="adi-catalog-group-content">{isLoading ? <Spinner /> : null}</div>
            ) : null}
        </div>
    );
}
