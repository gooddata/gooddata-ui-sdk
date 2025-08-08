// (C) 2007-2025 GoodData Corporation
import React, { useMemo } from "react";

import { OpenAction, IMenuPositionConfig, OnOpenedChange } from "../MenuSharedTypes.js";

import { MenuOpenedByClick } from "./MenuOpenedByClick.js";
import { MenuOpenedByHover } from "./MenuOpenedByHover.js";

export interface IMenuOpenerProps extends Partial<IMenuPositionConfig> {
    topLevelMenu: boolean;
    opened: boolean;
    onOpenedChange: OnOpenedChange;
    openAction?: OpenAction;
    portalTarget?: Element | null;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
}

const defaultProps: Pick<
    IMenuOpenerProps,
    "openAction" | "alignment" | "spacing" | "offset" | "portalTarget"
> = {
    openAction: "hover",

    alignment: ["right", "bottom"],
    spacing: 0,
    offset: 0,

    portalTarget: typeof document !== "undefined" ? document.querySelector("body") : null,
};

export function MenuOpener(props: IMenuOpenerProps) {
    // Filter out undefined values from props to avoid overriding defaults
    const definedProps = useMemo(() => {
        return Object.entries(props).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                (acc as any)[key] = value;
            }
            return acc;
        }, {} as Partial<IMenuOpenerProps>);
    }, [props]);

    const propsWithDefaults = useMemo(() => {
        return { ...defaultProps, ...definedProps } as IMenuOpenerProps & typeof defaultProps;
    }, [definedProps]);

    const Component = useMemo(() => {
        switch (propsWithDefaults.openAction) {
            case "click":
                return MenuOpenedByClick;
            case "hover":
                return MenuOpenedByHover;
        }
    }, [propsWithDefaults.openAction]) as React.ElementType;

    return (
        <Component
            opened={propsWithDefaults.opened}
            onOpenedChange={propsWithDefaults.onOpenedChange}
            topLevelMenu={propsWithDefaults.topLevelMenu}
            alignment={propsWithDefaults.alignment}
            spacing={propsWithDefaults.spacing}
            offset={propsWithDefaults.offset}
            toggler={propsWithDefaults.toggler}
            togglerWrapperClassName={propsWithDefaults.togglerWrapperClassName}
            portalTarget={propsWithDefaults.portalTarget}
        >
            <div className="gd-menuOpener">{propsWithDefaults.children}</div>
        </Component>
    );
}
