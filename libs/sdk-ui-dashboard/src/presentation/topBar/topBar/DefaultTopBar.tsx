// (C) 2021 GoodData Corporation
import React from "react";

import { selectIsExport, selectLocale, useDashboardSelector } from "../../../model";
import { IntlWrapper } from "../../localization";
import { ButtonBar } from "../buttonBar";
import { MenuButton } from "../menuButton";
import { Title, TitlePropsProvider } from "../title";

import { TopBarPropsProvider, useTopBarProps } from "./TopBarPropsContext";
import { ITopBarProps } from "./types";
import { HiddenTopBar } from "./HiddenTopBar";

const TopBarCore = (): JSX.Element => {
    const { menuButtonProps, titleProps, buttonBarProps } = useTopBarProps();
    return (
        <div className={"dash-header s-top-bar"}>
            <div className={"dash-header-inner"}>
                <TitlePropsProvider {...titleProps}>
                    <Title />
                </TitlePropsProvider>

                <ButtonBar {...buttonBarProps} />
            </div>
            <MenuButton {...menuButtonProps} />
        </div>
    );
};

/**
 * @internal
 */
export const DefaultTopBarInner = (): JSX.Element => {
    const isExport = useDashboardSelector(selectIsExport);
    const locale = useDashboardSelector(selectLocale);

    if (isExport) {
        return <HiddenTopBar />;
    }

    return (
        <IntlWrapper locale={locale}>
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
