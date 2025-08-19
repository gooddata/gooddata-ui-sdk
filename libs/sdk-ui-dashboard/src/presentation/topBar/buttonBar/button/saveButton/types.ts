// (C) 2022-2025 GoodData Corporation

import { ComponentType } from "react";

import { MessageDescriptor } from "react-intl";

/**
 * @beta
 */
export interface ISaveButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    isSaving: boolean;
    buttonTitle: MessageDescriptor;
    buttonValue: MessageDescriptor;
    onSaveClick: () => void;
}

/**
 * @beta
 */
export type CustomSaveButtonComponent = ComponentType<ISaveButtonProps>;
