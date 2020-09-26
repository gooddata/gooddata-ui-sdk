// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { GlobalEventBus, SomethingHappened } from "../events";

export function getTerminalSize(screen: blessed.Widgets.Screen): [number, number] {
    return [screen.program.rows, screen.program.cols];
}

export function appLogMessage(message: string) {
    const event: SomethingHappened = {
        type: "somethingHappened",
        body: {
            message,
        },
    };

    GlobalEventBus.post(event);
}
