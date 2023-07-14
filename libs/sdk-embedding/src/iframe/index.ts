// (C) 2007-2022 GoodData Corporation

export * from "./EmbeddedGdc.js";
export * from "./EmbeddedAnalyticalDesigner.js";
export * from "./EmbeddedKpiDashboard.js";

export {
    IObjectMeta,
    IPostMessageContextPayload,
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
} from "./common.js";
