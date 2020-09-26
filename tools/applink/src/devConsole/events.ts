// (C) 2020 GoodData Corporation

import { DependencyGraph, SdkPackageDescriptor } from "../base/types";
import { DependencyOnSdk } from "../devTo/dependencyDiscovery";

export type DcEventType =
    | "packagesInitialized"
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

export interface PackagesInitialized extends BaseDcEvent {
    type: "packagesInitialized";
    body: {
        packages: SdkPackageDescriptor[];
        graph: DependencyGraph;
    };
}

export interface FilesChanged extends BaseDcEvent {
    type: "filesChanged";
    body: {
        files: string[];
    };
}

export interface PackagesChanged extends BaseDcEvent {
    type: "packagesChanged";
    body: {
        packages: SdkPackageDescriptor[];
        graph: DependencyGraph;
    };
}

export interface BuildScheduled extends BaseDcEvent {
    type: "buildScheduled";
    body: {
        packages: SdkPackageDescriptor[];
    };
}

export interface PackageBuilt extends BaseDcEvent {
    type: "packageBuilt";
    body: {
        sdkPackage: SdkPackageDescriptor;
        exitCode: number;
        stdoutPath: string;
        stderrPath: string;
        duration: number;
    };
}

export interface BuildFinished extends BaseDcEvent {
    type: "buildFinished";
    body: {
        success: SdkPackageDescriptor[];
        fail: SdkPackageDescriptor[];
    };
}

export interface PackagePublished extends BaseDcEvent {
    type: "packagePublished";
    body: {
        sdkPackage: SdkPackageDescriptor;
        dependency: DependencyOnSdk;
    };
}

export interface SomethingHappened extends BaseDcEvent {
    type: "somethingHappened";
    body: {
        message: string;
    };
}

export type DcEvent =
    | PackagesInitialized
    | FilesChanged
    | PackagesChanged
    | BuildScheduled
    | PackageBuilt
    | BuildFinished
    | PackagePublished
    | SomethingHappened;

export interface IEventListener {
    onEvent: (event: DcEvent) => void;
}
export type EventListener = ((event: DcEvent) => void) | IEventListener;

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

export const GlobalEventBus = new EventBus();
