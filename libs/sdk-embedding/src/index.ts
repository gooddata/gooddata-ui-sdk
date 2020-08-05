// (C) 2019-2020 GoodData Corporation

export {
    IObjectMeta,
    IPostMessageContextPayload,
    EmbeddedGdc,
    GdcErrorType,
    GdcEventType,
    GdcMessageEventListener,
    GdcProductName,
    IGdcMessage,
    IGdcMessageEnvelope,
    IGdcMessageEvent,
    IGdcMessageEventListenerConfig,
    CommandFailed,
    CommandFailedData,
    ICommandFailedBody,
    IDrillableItemsCommandBody,
    ISimpleDrillableItemsCommandBody,
    isCommandFailedData,
    getEventType,
} from "./iframe/common";

export { EmbeddedAnalyticalDesigner } from "./iframe/ad";

export { EmbeddedKpiDashboard } from "./iframe/kd";

import * as filterConvertors from "./internal/filterConvertors";
import * as messagingUtils from "./internal/messagingUtils";

export { filterConvertors, messagingUtils };
