// (C) 2020-2021 GoodData Corporation

import { SourceDescriptor, TargetDescriptor } from "../base/types.js";

export type DcEventType =
    | "sourceInitialized"
    | "targetSelected"
    | "filesChanged"
    | "packagesChanged"
    | "buildScheduled"
    | "buildRequested"
    | "buildStarted"
    | "buildFinished"
    | "packagesRebuilt"
    | "publishFinished"
    | "packagesSelected"
    | "buildOutputRequested"
    | "buildOutputExited"
    | "autobuildToggled"
    | "somethingHappened";

interface BaseDcEvent {
    type: DcEventType;
}

//
//
//

/**
 * This event is emitted once the app discovers all necessary information about the source packages.
 */
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

/**
 * This event is emitted once the app discovers all the necessary information about the target to which
 * it will be publishing updated builds.
 */
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
     * Name of package which has changed.
     */
    packageName: string;

    /**
     * Files that have changed.
     */
    files: string[];

    /**
     * If specified, indicates that the package change should not trigger rebuild of change package's dependencies.
     */
    independent?: boolean;
};

/**
 * This event is emitted when the app discovers that source code in one or more packages has changed.
 */
export interface PackagesChanged extends BaseDcEvent {
    type: "packagesChanged";
    body: {
        /**
         * Packages whose sources have changed.
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

/**
 * This event is emitted after builds of changed & impacted packages are scheduled.
 */
export interface BuildScheduled extends BaseDcEvent {
    type: "buildScheduled";
    body: {
        changes: PackageChange[];
        depending: string[][];
    };
}

export function buildScheduled(changes: PackageChange[], depending: string[][]): BuildScheduled {
    return {
        type: "buildScheduled",
        body: {
            changes,
            depending,
        },
    };
}

//
//
//

/**
 * This event is emitted when the app requests that a particular package must be rebuilt.
 */
export interface BuildRequested extends BaseDcEvent {
    type: "buildRequested";
    body: {
        packageName: string;
    };
}

export function buildRequested(packageName: string): BuildRequested {
    return {
        type: "buildRequested",
        body: {
            packageName,
        },
    };
}

//
//
//

/**
 * This event is emitted when the app starts building a package.
 */
export interface BuildStarted extends BaseDcEvent {
    type: "buildStarted";
    body: {
        packageName: string;
    };
}

export function buildStarted(packageName: string): BuildStarted {
    return {
        type: "buildStarted",
        body: {
            packageName,
        },
    };
}

//
//
//

export type BuildResult = {
    packageName: string;
    exitCode: number;
    stdoutPath: string;
    stderrPath: string;
    duration: number;
};

/**
 * This event is emitted when app finished building a package.
 */
export interface BuildFinished extends BaseDcEvent {
    type: "buildFinished";
    body: BuildResult;
}

export function buildFinished(result: BuildResult): BuildFinished {
    return {
        type: "buildFinished",
        body: result,
    };
}

//
//
//

/**
 * This event is emitted once the app rebuilds all packages impacted by changes described in {@link PackagesChanged}
 */
export interface PackagesRebuilt extends BaseDcEvent {
    type: "packagesRebuilt";
    body: {
        packages: string[];
    };
}

export function packagesRebuilt(packages: string[]): PackagesRebuilt {
    return {
        type: "packagesRebuilt",
        body: {
            packages,
        },
    };
}

//
//
//

/*
 * This event is emitted once the app publishes build from source to target.
 */
export interface PublishFinished extends BaseDcEvent {
    type: "publishFinished";
    body: {
        packageName: string;
        exitCode: number;
    };
}

export function publishFinished(packageName: string, exitCode: number): PublishFinished {
    return {
        type: "publishFinished",
        body: {
            packageName,
            exitCode,
        },
    };
}

//
//
//

/**
 * This event is emitted once the user of the app selects one or more packages to target for commands.
 */
export interface PackagesSelected extends BaseDcEvent {
    type: "packagesSelected";
    body: {
        packages: string[];
    };
}

export function packagesSelected(packages: string | string[]): PackagesSelected {
    return {
        type: "packagesSelected",
        body: {
            packages: typeof packages === "string" ? [packages] : packages,
        },
    };
}

//
//
//

/**
 * This event is emitted once the user of the app wants to see build output for particular package.
 */
export interface BuildOutputRequested extends BaseDcEvent {
    type: "buildOutputRequested";
    body: {
        packageName: string;
    };
}

export function buildOutputRequested(packageName: string): BuildOutputRequested {
    return {
        type: "buildOutputRequested",
        body: {
            packageName,
        },
    };
}

//
//
//

/**
 * This event is emitted once the user of the app exits the build output browser and wants to navigate within
 * the list of packages again.
 */
export interface BuildOutputExited extends BaseDcEvent {
    type: "buildOutputExited";
}

export function buildOutputExited(): BuildOutputExited {
    return {
        type: "buildOutputExited",
    };
}

//
//
//

export interface AutobuildToggled extends BaseDcEvent {
    type: "autobuildToggled";
    body: {
        value: boolean;
    };
}

export function autobuildToggled(value: boolean): AutobuildToggled {
    return {
        type: "autobuildToggled",
        body: {
            value,
        },
    };
}

//
//
//

export type Severity = "info" | "important" | "warn" | "error" | "fatal";

/**
 * This event is emitted when something note-worthy happens.
 */
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

/**
 * All recognized events.
 */
export type DcEvent =
    | SourceInitialized
    | TargetSelected
    | PackagesChanged
    | BuildScheduled
    | BuildRequested
    | BuildStarted
    | BuildFinished
    | PackagesRebuilt
    | PublishFinished
    | PackagesSelected
    | BuildOutputRequested
    | BuildOutputExited
    | AutobuildToggled
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
            setTimeout(this.processEvent, 0);
        }
    };

    public register = (listener: EventListener): void => {
        this.listeners.push(listener);
    };

    public post = (event: DcEvent): void => {
        this.queue.push(event);

        setTimeout(this.processEvent, 0);
    };
}

/**
 * Single instance of the event bus. All components should would register and/or post to this bus.
 */
export const GlobalEventBus = new EventBus();
