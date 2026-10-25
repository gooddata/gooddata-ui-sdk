// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import classNames from "classnames";

interface IShortcutProps {
    primary?: boolean;
    secondary?: boolean;
    children: ReactNode;
}

export function Shortcut({ primary = false, secondary = false, children }: IShortcutProps) {
    const getClassNames = () => {
        return classNames("adi-shortcut", {
            primary,
            secondary,
        });
    };

    return <div className={getClassNames()}>{children}</div>;
}
