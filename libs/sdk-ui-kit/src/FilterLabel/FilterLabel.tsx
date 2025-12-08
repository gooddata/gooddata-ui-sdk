// (C) 2007-2025 GoodData Corporation

import { ReactNode, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { IFilterLabelProps } from "./typings.js";

/**
 * @internal
 */
export const FilterLabel = memo(function FilterLabel({
    isAllSelected = false,
    isDate = false,
    selection = "",
    noData = false,
    selectionSize,
    title,
}: IFilterLabelProps): ReactNode {
    const intl = useIntl();
    const [hasEllipsis, setHasEllipsis] = useState<boolean>(false);
    const labelRef = useRef<HTMLSpanElement>(null);

    const checkEllipsis = useCallback((): void => {
        if (!labelRef.current) return;

        const { offsetWidth, scrollWidth } = labelRef.current;
        // for some reason, IE11 returns offsetWidth = scrollWidth - 1 even when there is no ellipsis
        const newHasEllipsis = offsetWidth < scrollWidth - 1;
        if (newHasEllipsis !== hasEllipsis) {
            setHasEllipsis(newHasEllipsis);
        }
    }, [hasEllipsis]);

    useEffect(() => {
        checkEllipsis();
    }, [checkEllipsis]);

    const renderSelectionLabel = useCallback((content: ReactNode): ReactNode => {
        return <span className="count s-total-count">{content}</span>;
    }, []);

    const renderSelection = useMemo((): ReactNode => {
        if (!isDate && !noData) {
            if (isAllSelected) {
                return renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.all" }));
            }

            if (selectionSize === 0) {
                return renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.none" }));
            }

            if (hasEllipsis && selectionSize !== undefined && selectionSize > 0) {
                return renderSelectionLabel(`(${selectionSize})`);
            }
        }

        return false;
    }, [isDate, noData, isAllSelected, selectionSize, hasEllipsis, renderSelectionLabel, intl]);

    const renderTitle = useMemo((): ReactNode => {
        return [
            <span className="filter-label-title" key="title" title={title}>
                {title}
            </span>,
            isAllSelected && !isDate && !noData ? <span key="title-colon">: </span> : false,
        ];
    }, [title, isAllSelected, isDate, noData]);

    const renderSelectedElements = useMemo((): ReactNode => {
        if (!selection || isAllSelected) {
            return false;
        }

        return [
            <span key="selection-colon">: </span>,
            <span className="filter-label-selection" key="selection">
                {selection}
            </span>,
        ];
    }, [selection, isAllSelected]);

    return (
        <div role="attribute-filter-label" className="adi-attribute-filter-label s-attribute-filter-label">
            <span className="label" ref={labelRef}>
                {renderTitle}
                {renderSelectedElements}
            </span>
            {renderSelection}
        </div>
    );
});
