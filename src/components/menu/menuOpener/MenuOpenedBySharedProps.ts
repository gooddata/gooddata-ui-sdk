// (C) 2007-2018 GoodData Corporation
import { IMenuPositionProps } from "../positioning/MenuPosition";
import { OnOpenedChange } from "../MenuSharedTypes";

export interface IMenuOpenedBySharedProps extends IMenuPositionProps {
    portalTarget: Element;
    onOpenedChange: OnOpenedChange;
    togglerWrapperClassName?: string;
}
