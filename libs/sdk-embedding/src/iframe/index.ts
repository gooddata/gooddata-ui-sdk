// (C) 2007-2024 GoodData Corporation

export * from "./EmbeddedGdc.js";
export * from "./EmbeddedAnalyticalDesigner.js";
export * from "./EmbeddedKpiDashboard.js";
export * from "./legacyTypes.js";

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
