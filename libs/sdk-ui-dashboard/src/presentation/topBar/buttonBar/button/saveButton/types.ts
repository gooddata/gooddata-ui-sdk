// (C) 2022-2025 GoodData Corporation

import { type ComponentType } from "react";

import { type MessageDescriptor } from "react-intl";

/**
 * @beta
 */
export interface ISaveButtonProps {
    isVisible: boolean;
    isEnabled: boolean;
    isSaving: boolean;
    buttonTitle: MessageDescriptor;
    onSaveClick: () => void;
}

/**
 * @beta
 */
export type CustomSaveButtonComponent = ComponentType<ISaveButtonProps>;
