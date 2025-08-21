// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useCallback, useMemo, useRef, useState } from "react";

import { PositionedMenuContent } from "./PositionedMenuContent.js";
import { IMenuPositionConfig } from "../MenuSharedTypes.js";
import { RenderChildrenInPortal } from "../utils/RenderChildrenInPortal.js";

export interface IMenuPositionProps extends IMenuPositionConfig {
    opened: boolean;
    topLevelMenu: boolean;
    portalTarget: Element;
    contentWrapper?: (props: { children: React.ReactNode }) => ReactElement;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
    className?: string;
}

export interface IMenuPositionState {
    togglerElInitialized: boolean;
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return <div className="gd-menuPosition-wrapper">{children}</div>;
}

function PortalIfTopLevelMenu({
    topLevelMenu,
    children,
    portalTarget,
}: {
    children: React.ReactNode;
    portalTarget: Element;
    topLevelMenu: boolean;
}) {
    return topLevelMenu ? (
        <RenderChildrenInPortal targetElement={portalTarget}>{children}</RenderChildrenInPortal>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );
}

export function MenuPosition(props: IMenuPositionProps) {
    const {
        portalTarget,
        topLevelMenu,
        contentWrapper: ContentWrapper = React.Fragment,
        toggler,
        opened,
        alignment,
        spacing,
        offset,
        togglerWrapperClassName,
        children,
    } = props;

    const [togglerElInitialized, setTogglerElInitialized] = useState(false);
    const togglerEl = useRef<HTMLElement | null>(null);

    // React Measure is not used because it cannot detect the left/top coordinate
    // changes of absolute positioned blocks. This caused problems where left/top
    // positions from React Measure were outdated. To solve this we do the
    // measurements manually in PositionedMenuContent at the correct time.

    const setTogglerEl = useCallback((el: HTMLElement | null) => {
        togglerEl.current = el;
        setTogglerElInitialized(true);
    }, []);

    // Top level menu uses React portals to be rendered in body element (or
    // any element specified in targetElement prop). Any submenus are rendered
    // inside of previous menu, so they do not need any portals.

    const MaybeWrapper = useMemo(() => (topLevelMenu ? React.Fragment : Wrapper), [topLevelMenu]);

    return (
        <MaybeWrapper>
            <div className={topLevelMenu ? togglerWrapperClassName : undefined} ref={setTogglerEl}>
                {toggler}
            </div>

            <PortalIfTopLevelMenu portalTarget={portalTarget} topLevelMenu={topLevelMenu}>
                {opened && togglerElInitialized ? (
                    <ContentWrapper>
                        <PositionedMenuContent
                            alignment={alignment}
                            spacing={spacing}
                            offset={offset}
                            topLevelMenu={topLevelMenu}
                            togglerEl={togglerEl.current}
                        >
                            {children}
                        </PositionedMenuContent>
                    </ContentWrapper>
                ) : null}
            </PortalIfTopLevelMenu>
        </MaybeWrapper>
    );
}
