// (C) 2021 GoodData Corporation
import React from "react";

import { IntlWrapper } from "../../localization";
import { IDefaultTopBarProps } from "../types";

import { DefaultButtonBar } from "./DefaultButtonBar";
import { DefaultMenuButton } from "./DefaultMenuButton";
import { DefaultTitle } from "./DefaultTitle";

const TopBarCore: React.FC<IDefaultTopBarProps> = (props) => {
    const { titleProps: titleProperties, titleConfig, buttonBarConfig, menuButtonConfig } = props;

    return (
        <div className={"dash-header s-top-bar"}>
            <div className={"dash-header-inner"}>
                {titleConfig?.Component ? (
                    <titleConfig.Component {...titleProperties} />
                ) : (
                    <DefaultTitle {...titleProperties} />
                )}

                {buttonBarConfig?.Component ? <buttonBarConfig.Component /> : <DefaultButtonBar />}
            </div>
            {menuButtonConfig?.Component ? (
                <menuButtonConfig.Component />
            ) : (
                <DefaultMenuButton
                    {...menuButtonConfig?.defaultComponentProps}
                    {...menuButtonConfig?.defaultComponentCallbackProps}
                />
            )}
        </div>
    );
};

/**
 * @internal
 */
export const DefaultTopBar: React.FC<IDefaultTopBarProps> = (props) => {
    return (
        <IntlWrapper>
            <TopBarCore {...props} />
        </IntlWrapper>
    );
};
