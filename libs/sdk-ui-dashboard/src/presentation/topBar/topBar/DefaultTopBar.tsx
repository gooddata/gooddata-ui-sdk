// (C) 2021 GoodData Corporation
import React from "react";

import { selectIsExport, selectLocale, useDashboardSelector } from "../../../model";
import { IntlWrapper } from "../../localization";
import { ButtonBar } from "../buttonBar";
import { MenuButton } from "../menuButton";
import { Title } from "../title";
import { ITopBarProps } from "./types";
import { HiddenTopBar } from "./HiddenTopBar";

const TopBarCore = (props: ITopBarProps): JSX.Element => {
    const { menuButtonProps, titleProps, buttonBarProps } = props;
    return (
        <div className={"dash-header s-top-bar"}>
            <div className={"dash-header-inner"}>
                <Title {...titleProps} />

                <ButtonBar {...buttonBarProps} />
            </div>
            <MenuButton {...menuButtonProps} />
        </div>
    );
};

/**
 * @alpha
 */
export const DefaultTopBar = (props: ITopBarProps): JSX.Element => {
    const isExport = useDashboardSelector(selectIsExport);
    const locale = useDashboardSelector(selectLocale);

    if (isExport) {
        return <HiddenTopBar {...props} />;
    }

    return (
        <IntlWrapper locale={locale}>
            <TopBarCore {...props} />
        </IntlWrapper>
    );
};
