// (C) 2025 GoodData Corporation

import React, { useEffect, useRef, useState } from "react";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { IconType } from "../@types/icon.js";

/**
 * @internal
 */
export interface UiChipProps {
    label: string;
    tag?: string;
    isDeletable?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    iconBefore?: IconType;
    onClick?: () => void;
    onDelete?: () => void;
}

const { b, e } = bem("gd-ui-kit-chip");

/**
 * @internal
 */
export const UiChip = ({
    label,
    tag,
    isDeletable = false,
    isActive = false,
    isLocked = false,
    iconBefore,
    onClick,
    onDelete,
}: UiChipProps) => {
    const elemRef = useRef<HTMLDivElement>(null);
    const [widthObj, setWidthObj] = useState({});

    useEffect(() => {
        if (elemRef.current) {
            setWidthObj({ width: elemRef.current.offsetWidth });
        }
    }, []);

    return (
        <div className={b()} ref={elemRef} style={{ ...widthObj }}>
            <button
                aria-label={isActive ? "Close" : "Open"}
                aria-expanded={isActive}
                className={e("trigger", { isDeletable, isActive, isLocked })}
                disabled={isLocked}
                onClick={onClick}
            >
                {iconBefore ? (
                    <span className={e("icon-before")}>
                        <UiIcon type={iconBefore} color="primary" size={15} />
                    </span>
                ) : null}
                <span className={e("label")}>{label}</span>
                {tag ? <span className={e("tag")}>{tag}</span> : null}
                {isLocked ? (
                    <span className={e("icon-lock")}>
                        <UiIcon type="lock" label="Locked" color="complementary-6" size={14} />
                    </span>
                ) : (
                    <span className={e("icon-chevron", { isActive })}>
                        <UiIcon
                            type={isActive ? "chevronUp" : "chevronDown"}
                            label={isActive ? "Close" : "Open"}
                            color="complementary-7"
                            size={8}
                        />
                    </span>
                )}
            </button>
            {isDeletable ? (
                <button aria-label="Delete" className={e("delete")} onClick={onDelete}>
                    <span className={e("icon-delete")}>
                        <UiIcon type="cross" label="Delete" color="complementary-6" size={14} />
                    </span>
                </button>
            ) : null}
        </div>
    );
};
