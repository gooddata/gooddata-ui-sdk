// (C) 2020-2021 GoodData Corporation

import { DcEvent, EventBus, GlobalEventBus, IEventListener, publishFinished } from "../events.js";

/**
 * This implementation of package build publisher will emit publishFinished for each package that was rebuilt.
 *
 * Such implementation is useful for autoBuild mode where no publication is actually needed.
 */
export class NoopPublisher implements IEventListener {
    constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): NoopPublisher {
        return new NoopPublisher(eventBus);
    }

    public onEvent(event: DcEvent): void {
        // eslint-disable-next-line sonarjs/no-small-switch
        switch (event.type) {
            case "packagesRebuilt": {
                event.body.packages.forEach((packageName) => {
                    this.eventBus.post(publishFinished(packageName, 0));
                });
                break;
            }
        }
    }
}
