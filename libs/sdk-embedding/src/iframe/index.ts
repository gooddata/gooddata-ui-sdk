// (C) 2007-2026 GoodData Corporation

export * from "./EmbeddedGdc.js";
export * from "./EmbeddedAnalyticalDesigner.js";
export * from "./EmbeddedKpiDashboard.js";
export * from "./legacyTypes.js";

export {
    type IObjectMeta,
    type IPostMessageContextPayload,
    type GdcMessageEventListener,
    type IGdcMessage,
    type IGdcMessageEnvelope,
    type IGdcMessageEvent,
    type IGdcMessageEventListenerConfig,
    type CommandFailed,
    type CommandFailedData,
    type ICommandFailedBody,
    type IDrillableItemsCommandBody,
    type ISimpleDrillableItemsCommandBody,
    GdcErrorType,
    GdcEventType,
    GdcProductName,
    isCommandFailedData,
    getEventType,
} from "./common.js";
