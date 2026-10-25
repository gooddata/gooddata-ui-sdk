// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { DndProvider } from "@evil-internetmann/react-dnd";
import { TestBackend } from "react-dnd-test-backend";

export function withDragDrop<T>(WrappedComponent: ComponentType<T>): ComponentType<T> {
    function WithDragDrop(props: T) {
        return (
            <DndProvider backend={TestBackend}>
                <WrappedComponent {...props} />
            </DndProvider>
        );
    }

    return WithDragDrop;
}
