// (C) 2020 GoodData Corporation

import { SourceDescriptor, TargetDependency, TargetDescriptor } from "../base/types";

export type DcEventType =
    | "sourceInitialized"
    | "targetSelected"
    | "filesChanged"
    | "packagesChanged"
    | "buildScheduled"
    | "packageBuilt"
    | "buildFinished"
    | "packagePublished"
    | "somethingHappened";

interface BaseDcEvent {
    type: DcEventType;
}

//
//
//

export interface SourceInitialized extends BaseDcEvent {
    type: "sourceInitialized";
    body: {
        sourceDescriptor: SourceDescriptor;
    };
}

export function sourceInitialized(sourceDescriptor: SourceDescriptor): SourceInitialized {
    return {
        type: "sourceInitialized",
        body: {
            sourceDescriptor,
        },
    };
}

//
//
//

export interface TargetSelected extends BaseDcEvent {
    type: "targetSelected";
    body: {
        targetDescriptor: TargetDescriptor;
    };
}

export function targetSelected(targetDescriptor: TargetDescriptor): TargetSelected {
    return {
        type: "targetSelected",
        body: {
            targetDescriptor,
        },
    };
}

//
//
//

export type PackageChange = {
    /**
     * Name of package which has changed
     */
    packageName: string;
    files: string[];
};

/**
 * One or more source packages had their source files changed.
 */
export interface PackagesChanged extends BaseDcEvent {
    type: "packagesChanged";
    body: {
        /**
         * Packages whose sources have changed
         */
        changes: PackageChange[];
    };
}

export function packagesChanged(changes: PackageChange[]): PackagesChanged {
    return {
        type: "packagesChanged",
        body: {
            changes,
        },
    };
}

//
//
//

export interface BuildScheduled extends BaseDcEvent {
    type: "buildScheduled";
    body: {
        packages: string[];
    };
}

export interface PackageBuilt extends BaseDcEvent {
    type: "packageBuilt";
    body: {
        packageName: string;
        exitCode: number;
        stdoutPath: string;
        stderrPath: string;
        duration: number;
    };
}

export interface BuildFinished extends BaseDcEvent {
    type: "buildFinished";
    body: {
        success: string[];
        fail: string[];
    };
}

export interface PackagePublished extends BaseDcEvent {
    type: "packagePublished";
    body: {
        packageName: string;
        dependency: TargetDependency;
    };
}

export type Severity = "info" | "important" | "warn" | "error" | "fatal";

export interface SomethingHappened extends BaseDcEvent {
    type: "somethingHappened";
    body: {
        severity: Severity;
        message: string;
    };
}

export function somethingHappened(severity: Severity, message: string): SomethingHappened {
    return {
        type: "somethingHappened",
        body: {
            severity,
            message,
        },
    };
}

export type DcEvent =
    | SourceInitialized
    | TargetSelected
    | PackagesChanged
    | BuildScheduled
    | PackageBuilt
    | BuildFinished
    | PackagePublished
    | SomethingHappened;

//
//
//

export interface IEventListener {
    onEvent: (event: DcEvent) => void;
}
export type EventListener = ((event: DcEvent) => void) | IEventListener;

/**
 * Simple event bus allows registration of listener functions to which all post-ed events will be dispatched.
 */
export class EventBus {
    private readonly queue: DcEvent[] = [];
    private readonly listeners: EventListener[] = [];

    private processEvent = (): void => {
        const event = this.queue.shift();

        if (!event) {
            return;
        }

        for (const listener of this.listeners) {
            try {
                if (typeof listener === "function") {
                    listener(event);
                } else {
                    listener.onEvent(event);
                }
            } catch (e) {
                console.error("Error occurred while processing event: ", e);
                console.trace();
            }
        }

        if (this.queue.length > 0) {
            setTimeout(this.processEvent);
        }
    };

    public register = (listener: EventListener): void => {
        this.listeners.push(listener);
    };

    public post = (event: DcEvent): void => {
        this.queue.push(event);

        setTimeout(this.processEvent);
    };
}

/**
 * Single instance of the event bus. All comonents should would register and/or post to this bus.
 */
export const GlobalEventBus = new EventBus();
