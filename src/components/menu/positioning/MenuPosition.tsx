// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import PositionedMenuContent from './PositionedMenuContent';
import { IMenuPositionConfig } from '../MenuSharedTypes';
import RenderChildrenInPortal from '../utils/RenderChildrenInPortal';

export interface IMenuPositionProps extends IMenuPositionConfig {
    opened: boolean;
    topLevelMenu: boolean;
    portalTarget: Element;
    contentWrapper?: (props: { children: React.ReactNode }) => JSX.Element;
    toggler: React.ReactNode;
    children: React.ReactNode;
}

export interface IMenuPositionState {
    togglerElInitialized: boolean;
}

export default class MenuPosition extends React.Component<IMenuPositionProps, IMenuPositionState> {
    public static defaultProps = {
        contentWrapper: React.Fragment
    };

    public state = {
        togglerElInitialized: false
    };

    private togglerEl: HTMLElement = null;

    // React Measure is not used because it cannot detect the left/top coordinate
    // changes of absolute positioned blocks. This caused problems where left/top
    // positions from React Measure were outdated. To solve this we do the
    // measurements manually in PositionedMenuContent at the correct time.

    public render() {
        // Top level menu uses React portals to be rendered in body element (or
        // any element specified in targetElement prop). Any submenus are rendered
        // inside of previous menu, so they do not need any portals.
        const PortalIfTopLevelMenu = this.props.topLevelMenu
            ? (props: { children: React.ReactNode }) => (
                  <RenderChildrenInPortal targetElement={this.props.portalTarget}>
                      {props.children}
                  </RenderChildrenInPortal>
              )
            : React.Fragment;

        const ContentWrapper = this.props.contentWrapper;

        return (
            <div style={this.props.topLevelMenu ? null : { position: 'relative' }}>
                <div style={this.props.topLevelMenu ? { display: 'inline-block' } : null} ref={this.setTogglerEl}>
                    {this.props.toggler}
                </div>

                <PortalIfTopLevelMenu>
                    {this.props.opened && this.state.togglerElInitialized && (
                        <ContentWrapper>
                            <PositionedMenuContent
                                alignment={this.props.alignment}
                                spacing={this.props.spacing}
                                offset={this.props.offset}
                                topLevelMenu={this.props.topLevelMenu}
                                togglerEl={this.togglerEl}
                            >
                                {this.props.children}
                            </PositionedMenuContent>
                        </ContentWrapper>
                    )}
                </PortalIfTopLevelMenu>
            </div>
        );
    }

    private setTogglerEl = (el: HTMLElement) => {
        this.togglerEl = el;
        this.setState({
            togglerElInitialized: true
        });
    }
}
