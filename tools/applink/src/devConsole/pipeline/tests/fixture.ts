// (C) 2020 GoodData Corporation
import { SourceDescriptor, TargetDescriptor } from "../../../base/types.js";
import source from "./source.json";
import target from "./target.json";
import { naiveFilterDependencyGraph } from "../../../base/dependencyGraph.js";
import { buildFinished, DcEvent, DcEventType, EventBus, IEventListener } from "../../events.js";

function loadSource(src: any): SourceDescriptor {
    const sourceDescriptor: SourceDescriptor = src;

    return {
        ...sourceDescriptor,
        dependencyGraph: naiveFilterDependencyGraph(
            sourceDescriptor.dependencyGraph,
            sourceDescriptor.dependencyGraph.nodes,
        ),
    };
}

export const TestSourceDescriptor = loadSource(source);
export const TestTargetDescriptor = target as TargetDescriptor;

export type MockBuilderResult = (packageName: string) => number;
export const FailAllBuilds = (): number => 1;
export const SucceedAllBuilds = (): number => 0;

export class MockBuilder implements IEventListener {
    private constructor(
        private readonly eventBus: EventBus,
        private resultFn: MockBuilderResult = SucceedAllBuilds,
    ) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus, resultFn: MockBuilderResult = SucceedAllBuilds): MockBuilder {
        return new MockBuilder(eventBus, resultFn);
    }

    public setResultFn = (resultFn: MockBuilderResult): void => {
        this.resultFn = resultFn;
    };

    public onEvent = (event: DcEvent): void => {
        // eslint-disable-next-line sonarjs/no-small-switch
        switch (event.type) {
            case "buildRequested": {
                const { packageName } = event.body;
                const exitCode = this.resultFn(packageName);

                this.eventBus.post(
                    buildFinished({
                        packageName,
                        stdoutPath: "/dev/null",
                        stderrPath: "/dev/null",
                        exitCode,
                        duration: 0,
                    }),
                );

                break;
            }
        }
    };
}

export class EventCollector implements IEventListener {
    public readonly events: DcEvent[] = [];
    private waitingFor: DcEventType | undefined;
    private waitingForStartIdx: number = 0;

    private timeoutId: any | undefined;
    private resolveWait: ((event: DcEvent) => void) | undefined;
    private rejectWait: ((e: Error) => void) | undefined;

    constructor(private readonly eventBus: EventBus, private readonly eventTypes?: DcEventType[]) {
        this.eventBus.register(this);
    }

    public onEvent = (event: DcEvent): void => {
        if (!this.eventTypes || this.eventTypes.includes(event.type)) {
            this.events.push(event);
            this.checkWaitFor();
        }
    };

    public waitFor = (eventType: DcEventType, timeoutMs: number = 10000): Promise<DcEvent> => {
        this.waitingFor = eventType;

        return new Promise<DcEvent>((res, rej) => {
            this.resolveWait = res;
            this.rejectWait = rej;

            if (this.timeoutId !== undefined) {
                clearTimeout(this.timeoutId);
            }

            this.timeoutId = setTimeout(() => {
                this.rejectWait?.(new Error("timed out"));
            }, timeoutMs);

            this.checkWaitFor();
        });
    };

    private checkWaitFor = (): void => {
        for (; this.waitingForStartIdx < this.events.length; this.waitingForStartIdx++) {
            const event = this.events[this.waitingForStartIdx];

            if (event.type === this.waitingFor) {
                this.resolveWait?.(event);
                break;
            }
        }
    };
}
