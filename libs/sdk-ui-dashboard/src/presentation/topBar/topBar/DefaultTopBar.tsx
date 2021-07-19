// (C) 2021 GoodData Corporation
import React from "react";

import { IntlWrapper } from "../../localization";
import { ButtonBar, ButtonBarPropsProvider } from "../buttonBar";
import { MenuButton, MenuButtonPropsProvider } from "../menuButton";
import { Title, TitlePropsProvider } from "../title";

import { TopBarPropsProvider, useTopBarProps } from "./TopBarPropsContext";
import { ITopBarProps } from "./types";

const TopBarCore = (): JSX.Element => {
    const { menuButtonProps, titleProps } = useTopBarProps();

    return (
        <div className={"dash-header s-top-bar"}>
            <div className={"dash-header-inner"}>
                <TitlePropsProvider {...titleProps}>
                    <Title />
                </TitlePropsProvider>

                {/* no props here for now */}
                <ButtonBarPropsProvider>
                    <ButtonBar />
                </ButtonBarPropsProvider>
            </div>
            <MenuButtonPropsProvider {...menuButtonProps}>
                <MenuButton />
            </MenuButtonPropsProvider>
        </div>
    );
};

/**
 * @internal
 */
export const DefaultTopBarInner = (): JSX.Element => {
    return (
        <IntlWrapper>
            <TopBarCore />
        </IntlWrapper>
    );
};

/**
 * @alpha
 */
export const DefaultTopBar = (props: ITopBarProps): JSX.Element => {
    return (
        <TopBarPropsProvider {...props}>
            <DefaultTopBarInner />
        </TopBarPropsProvider>
    );
};
