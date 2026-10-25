// (C) 2007-2026 GoodData Corporation

import { Children, type ReactElement, type ReactNode, type Ref, cloneElement, memo } from "react";

interface IDropdownButtonWrapperProps {
    setRef: Ref<HTMLDivElement>;
    children: ReactNode;
}

export const DropdownButtonWrapper = memo(function DropdownButtonWrapper(props: IDropdownButtonWrapperProps) {
    return (
        <div ref={props.setRef}>
            {Children.map(props.children, (child) => cloneElement(child as ReactElement, { ...props }))}
        </div>
    );
});
