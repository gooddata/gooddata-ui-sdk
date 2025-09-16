// (C) 2007-2025 GoodData Corporation

import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";

import { stringUtils } from "@gooddata/util";

import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";

const BUBBLE_OFFSET_X = 16;

/**
 * @internal
 */
export interface ILegacySingleSelectListItemProps {
    source: any;
    selected: boolean;
    onSelect: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onMouseOut?: (source: any) => void;
}

/**
 * @internal
 */
export interface ILegacySingleSelectListItemState {
    isOverflowed: boolean;
}

/**
 * @internal
 * @deprecated This component is deprecated use SingleSelectListItem instead
 */
export function LegacySingleSelectListItem({
    source,
    selected,
    onSelect,
    onMouseOver = noop,
    onMouseOut = noop,
}: ILegacySingleSelectListItemProps): ReactElement {
    const [isOverflowed, setIsOverflowed] = useState(false);
    const nodeRef = useRef<HTMLSpanElement>(null);

    const checkOverflow = useCallback((): void => {
        if (nodeRef.current) {
            // Checks if ellipsis has been applicated on title span
            const newIsOverflowed = nodeRef.current.offsetWidth < nodeRef.current.scrollWidth;
            if (newIsOverflowed !== isOverflowed) {
                setIsOverflowed(newIsOverflowed);
            }
        }
    }, [isOverflowed]);

    useEffect(() => {
        checkOverflow();
    });

    const classNames = useMemo((): string => {
        const generatedSeleniumClass = `s-${stringUtils.simplifyText(source.title)}`;

        return cx("gd-list-item", generatedSeleniumClass, { "is-selected": selected });
    }, [source.title, selected]);

    const handleSelect = useCallback((): void => {
        onSelect(source);
    }, [onSelect, source]);

    const handleMouseOver = useCallback((): void => {
        onMouseOver(source);
    }, [onMouseOver, source]);

    const handleMouseOut = useCallback((): void => {
        onMouseOut(source);
    }, [onMouseOut, source]);

    const renderTitle = useCallback(() => {
        const { title } = source;
        const titleElement = <span ref={nodeRef}>{title}</span>;

        if (isOverflowed) {
            return (
                <BubbleHoverTrigger>
                    {titleElement}
                    <Bubble
                        className="bubble-primary"
                        alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
                        arrowOffsets={{
                            "cr cl": [BUBBLE_OFFSET_X, 0],
                            "cl cr": [-BUBBLE_OFFSET_X, 0],
                        }}
                    >
                        {title}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }

        return titleElement;
    }, [isOverflowed, source]);

    const renderIcon = useCallback((icon: string) => {
        if (icon) {
            const iconClasses = cx("gd-list-icon", icon);
            return <span className={iconClasses} />;
        }

        return null;
    }, []);

    const icon = source?.icon;
    return (
        <div
            className={classNames}
            onClick={handleSelect}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            {renderIcon(icon)}
            {renderTitle()}
        </div>
    );
}
