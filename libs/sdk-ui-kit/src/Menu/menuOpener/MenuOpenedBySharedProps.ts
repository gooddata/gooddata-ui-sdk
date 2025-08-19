// (C) 2007-2025 GoodData Corporation
import { OnOpenedChange } from "../MenuSharedTypes.js";
import { IMenuPositionProps } from "../positioning/MenuPosition.js";

export interface IMenuOpenedBySharedProps extends IMenuPositionProps {
    portalTarget: Element;
    onOpenedChange: OnOpenedChange;
    togglerWrapperClassName?: string;
}
