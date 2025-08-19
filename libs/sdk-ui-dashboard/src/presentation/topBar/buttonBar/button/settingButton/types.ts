// (C) 2022-2025 GoodData Corporation

import { ComponentType } from "react";

import { MessageDescriptor } from "react-intl";

/**
 * @beta
 */
export interface ISettingButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    isSaving: boolean;
    buttonTitle: MessageDescriptor;
    buttonValue: MessageDescriptor;
    onSettingClick: () => void;
}

/**
 * @beta
 */
export type CustomSettingButtonComponent = ComponentType<ISettingButtonProps>;
