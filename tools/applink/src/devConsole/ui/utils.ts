// (C) 2020 GoodData Corporation
import blessed from "blessed";
import { GlobalEventBus, somethingHappened } from "../events.js";

export function getTerminalSize(screen: blessed.Widgets.Screen): [number, number] {
    return [screen.program.rows, screen.program.cols];
}

export function appLogInfo(message: string): void {
    GlobalEventBus.post(somethingHappened("info", message));
}

export function appLogImportant(message: string): void {
    GlobalEventBus.post(somethingHappened("important", message));
}

export function appLogWarn(message: string): void {
    GlobalEventBus.post(somethingHappened("warn", message));
}

export function appLogError(message: string): void {
    GlobalEventBus.post(somethingHappened("error", message));
}

export function appLogFatal(message: string): void {
    GlobalEventBus.post(somethingHappened("fatal", message));
}
