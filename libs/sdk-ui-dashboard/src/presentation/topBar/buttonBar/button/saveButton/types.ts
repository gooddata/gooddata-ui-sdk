// (C) 2022 GoodData Corporation

import { ComponentType } from "react";
import { MessageDescriptor } from "react-intl";

/**
 * @internal
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
 * @internal
 */
export type CustomSaveButtonComponent = ComponentType<ISaveButtonProps>;
