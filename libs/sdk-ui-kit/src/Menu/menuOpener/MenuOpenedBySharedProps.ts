// (C) 2007-2025 GoodData Corporation
import { type OnOpenedChange } from "../MenuSharedTypes.js";
import { type IMenuPositionProps } from "../positioning/MenuPosition.js";

export interface IMenuOpenedBySharedProps extends IMenuPositionProps {
    portalTarget: Element;
    onOpenedChange: OnOpenedChange;
    togglerWrapperClassName?: string;
}
