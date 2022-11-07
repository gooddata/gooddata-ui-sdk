// (C) 2022 GoodData Corporation
import { useEffect, useRef } from "react";
import { useDragDropManager } from "react-dnd";

export interface IUseDndNotificationProps {
    onStartDnd: () => void;
}

/**
 * This hook listen DragDropManager and fires onStartDnd callback
 * @internal
 */
export const useDndNotification = (props: IUseDndNotificationProps) => {
    const { onStartDnd } = props;

    const lastDndId = useRef<string | symbol | null>(null);

    const manager = useDragDropManager();

    useEffect(() => {
        const unsubscribe = manager.getMonitor().subscribeToStateChange(() => {
            // we need current dnd object id
            const dndId = manager.getMonitor().getSourceId();

            //we need just start dnd operation and we determine it that id is different than last id and is not null
            if (dndId !== lastDndId.current) {
                // store last id, dnd operation ends when id is null
                lastDndId.current = dndId;

                // fire event just once when id not null
                if (dndId) {
                    onStartDnd();
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [onStartDnd, manager]);
};
