// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PositionedMenuContent } from "./PositionedMenuContent.js";
import { IMenuPositionConfig } from "../MenuSharedTypes.js";
import { RenderChildrenInPortal } from "../utils/RenderChildrenInPortal.js";

export interface IMenuPositionProps extends IMenuPositionConfig {
    opened: boolean;
    topLevelMenu: boolean;
    portalTarget: Element;
    contentWrapper?: (props: { children: React.ReactNode }) => JSX.Element;
    toggler: React.ReactNode;
    togglerWrapperClassName?: string;
    children: React.ReactNode;
    className?: string;
}

export interface IMenuPositionState {
    togglerElInitialized: boolean;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="gd-menuPosition-wrapper">{children}</div>
);

const PortalIfTopLevelMenu = ({
    topLevelMenu,
    children,
    portalTarget,
}: {
    children: React.ReactNode;
    portalTarget: Element;
    topLevelMenu: boolean;
}) =>
    topLevelMenu ? (
        <RenderChildrenInPortal targetElement={portalTarget}>{children}</RenderChildrenInPortal>
    ) : (
        <React.Fragment>{children}</React.Fragment>
    );

export class MenuPosition extends React.Component<IMenuPositionProps, IMenuPositionState> {
    public static defaultProps = {
        contentWrapper: React.Fragment,
    };

    public state = {
        togglerElInitialized: false,
    };

    private togglerEl: HTMLElement | null = null;

    // React Measure is not used because it cannot detect the left/top coordinate
    // changes of absolute positioned blocks. This caused problems where left/top
    // positions from React Measure were outdated. To solve this we do the
    // measurements manually in PositionedMenuContent at the correct time.

    public render() {
        const {
            portalTarget,
            topLevelMenu,
            contentWrapper: ContentWrapper,
            toggler,
            opened,
            alignment,
            spacing,
            offset,
            togglerWrapperClassName,
            children,
        } = this.props;
        // Top level menu uses React portals to be rendered in body element (or
        // any element specified in targetElement prop). Any submenus are rendered
        // inside of previous menu, so they do not need any portals.

        const MaybeWrapper = topLevelMenu ? React.Fragment : Wrapper;

        return (
            <MaybeWrapper>
                <div className={topLevelMenu ? togglerWrapperClassName : undefined} ref={this.setTogglerEl}>
                    {toggler}
                </div>

                <PortalIfTopLevelMenu portalTarget={portalTarget} topLevelMenu={topLevelMenu}>
                    {opened && this.state.togglerElInitialized ? (
                        <ContentWrapper>
                            <PositionedMenuContent
                                alignment={alignment}
                                spacing={spacing}
                                offset={offset}
                                topLevelMenu={topLevelMenu}
                                togglerEl={this.togglerEl}
                            >
                                {children}
                            </PositionedMenuContent>
                        </ContentWrapper>
                    ) : null}
                </PortalIfTopLevelMenu>
            </MaybeWrapper>
        );
    }

    private setTogglerEl = (el: HTMLElement | null) => {
        this.togglerEl = el;
        this.setState({
            togglerElInitialized: true,
        });
    };
}
