// (C) 2024-2025 GoodData Corporation

import { ReactNode, useCallback, useRef, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { Bubble } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bc tr" }, { align: "tc br" }];

export function Popup({
    children,
    popup,
}: {
    children: ({ toggle, id }: { toggle: () => void; id: string }) => ReactNode;
    popup: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { current: id } = useRef(`popup-${uuidv4()}`);
    const toggle = useCallback(() => setIsOpen((x) => !x), []);
    const close = useCallback(() => setIsOpen(false), []);

    return (
        <>
            {children({ toggle, id })}
            {isOpen ? (
                <Bubble
                    alignPoints={ALIGN_POINTS}
                    alignTo={`#${id}`}
                    closeOnOutsideClick
                    closeOnParentScroll
                    onClose={close}
                >
                    {popup}
                </Bubble>
            ) : null}
        </>
    );
}
