// (C) 2007-2025 GoodData Corporation
import React, { ReactNode, useRef, useState, useEffect, memo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { IFilterLabelProps } from "./typings.js";

function WrappedFilterLabel(props: IFilterLabelProps & WrappedComponentProps): ReactNode {
    const {
        isAllSelected = false,
        isDate = false,
        selection = "",
        noData = false,
        selectionSize,
        intl,
        title,
    } = props;

    const [hasEllipsis, setHasEllipsis] = useState<boolean>(false);
    const labelRef = useRef<HTMLSpanElement>(null);

    const checkEllipsis = (): void => {
        if (!labelRef.current) return;

        const { offsetWidth, scrollWidth } = labelRef.current;
        // for some reason, IE11 returns offsetWidth = scrollWidth - 1 even when there is no ellipsis
        const newHasEllipsis = offsetWidth < scrollWidth - 1;
        if (newHasEllipsis !== hasEllipsis) {
            setHasEllipsis(newHasEllipsis);
        }
    };

    useEffect(() => {
        checkEllipsis();
    });

    const getIsDate = (): boolean => {
        return isDate;
    };

    const isAllSelectedCheck = (): boolean => {
        return isAllSelected;
    };

    const renderSelectionLabel = (content: ReactNode): ReactNode => {
        return <span className="count s-total-count">{content}</span>;
    };

    const renderSelection = (): ReactNode => {
        if (!getIsDate() && !noData) {
            if (isAllSelectedCheck()) {
                return renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.all" }));
            }

            if (selectionSize === 0) {
                return renderSelectionLabel(intl.formatMessage({ id: "gs.filterLabel.none" }));
            }

            if (hasEllipsis && selectionSize > 0) {
                return renderSelectionLabel(`(${selectionSize})`);
            }
        }

        return false;
    };

    const renderTitle = (): ReactNode => {
        return [
            <span className="filter-label-title" key="title" title={title}>
                {title}
            </span>,
            isAllSelectedCheck() && !getIsDate() && !noData ? <span key="title-colon">: </span> : false,
        ];
    };

    const renderSelectedElements = (): ReactNode => {
        if (!selection || isAllSelectedCheck()) {
            return false;
        }

        return [
            <span key="selection-colon">: </span>,
            <span className="filter-label-selection" key="selection">
                {selection}
            </span>,
        ];
    };

    return (
        <div role="attribute-filter-label" className="adi-attribute-filter-label s-attribute-filter-label">
            <span className="label" ref={labelRef}>
                {renderTitle()}
                {renderSelectedElements()}
            </span>
            {renderSelection()}
        </div>
    );
}

/**
 * @internal
 */
export const FilterLabel = injectIntl(memo(WrappedFilterLabel));
