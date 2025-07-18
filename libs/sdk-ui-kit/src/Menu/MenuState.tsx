// (C) 2007-2025 GoodData Corporation
import { useState, useCallback, ReactNode } from "react";

import { OnOpenedChange, IOnOpenedChangeParams } from "./MenuSharedTypes.js";

/**
 * @internal
 */
export interface IMenuStateConfig {
    opened?: boolean;
    defaultOpened?: boolean;
    onOpenedChange?: OnOpenedChange;
}

/**
 * @internal
 */
export interface IMenuStateProps extends IMenuStateConfig {
    children: (props: { opened: boolean; onOpenedChange: OnOpenedChange }) => ReactNode;
}

export interface IMenuStateState {
    opened?: boolean;
}

export function MenuState({ opened, defaultOpened = false, onOpenedChange, children }: IMenuStateProps) {
    const isControlled = (): boolean => {
        return typeof opened === "boolean";
    };

    const [internalOpened, setInternalOpened] = useState<boolean | undefined>(() => {
        return isControlled() ? opened : defaultOpened;
    });

    const handleOpenedChange = useCallback(
        (openedChangeParams: IOnOpenedChangeParams) => {
            setInternalOpened(openedChangeParams.opened);
            if (onOpenedChange) {
                onOpenedChange(openedChangeParams);
            }
        },
        [onOpenedChange],
    );

    return children({
        opened: (isControlled() ? opened : internalOpened) ?? false,
        onOpenedChange: handleOpenedChange,
    });
}
