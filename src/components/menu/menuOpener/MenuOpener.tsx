// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { OpenAction, IMenuPositionConfig, OnOpenedChange } from '../MenuSharedTypes';
import MenuOpenedByClick from './MenuOpenedByClick';
import MenuOpenedByHover from './MenuOpenedByHover';

export interface IMenuOpenerProps extends Partial<IMenuPositionConfig> {
    topLevelMenu: boolean;
    opened: boolean;
    onOpenedChange: OnOpenedChange;
    openAction?: OpenAction;
    portalTarget?: Element;
    toggler: React.ReactNode;
    children: React.ReactNode;
}

export default class MenuOpener extends React.Component<IMenuOpenerProps> {
    public static defaultProps: Partial<IMenuOpenerProps> = {
        openAction: 'hover',

        alignment: ['right', 'bottom'],
        spacing: 0,
        offset: 0,

        portalTarget: document.querySelector('body')
    };

    public render() {
        const Component = this.getComponentByOpenAction();

        return (
            <Component
                opened={this.props.opened}
                onOpenedChange={this.props.onOpenedChange}
                topLevelMenu={this.props.topLevelMenu}
                alignment={this.props.alignment}
                spacing={this.props.spacing}
                offset={this.props.offset}
                toggler={this.props.toggler}
                portalTarget={this.props.portalTarget}
            >
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    {this.props.children}
                </div>
            </Component>
        );
    }

    private getComponentByOpenAction = () => {
        switch (this.props.openAction) {
            case 'click':
                return MenuOpenedByClick;
            case 'hover':
                return MenuOpenedByHover;
        }
    }
}
