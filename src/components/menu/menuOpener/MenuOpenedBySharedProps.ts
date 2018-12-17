// (C) 2007-2018 GoodData Corporation
import { IMenuPositionProps } from '../positioning/MenuPosition';

export interface IMenuOpenedBySharedProps extends IMenuPositionProps {
    portalTarget: Element;
    onOpenedChange: (visible: boolean) => void;
}
