// (C) 2007-2024 GoodData Corporation

export * from "./EmbeddedGdc.js";
export * from "./EmbeddedAnalyticalDesigner.js";
export * from "./EmbeddedKpiDashboard.js";
export * from "./legacyTypes.js";

export type {
    IObjectMeta,
    IPostMessageContextPayload,
    GdcMessageEventListener,
    IGdcMessage,
    IGdcMessageEnvelope,
    IGdcMessageEvent,
    IGdcMessageEventListenerConfig,
    CommandFailed,
    CommandFailedData,
    ICommandFailedBody,
    IDrillableItemsCommandBody,
    ISimpleDrillableItemsCommandBody,
} from "./common.js";
export { GdcErrorType, GdcEventType, GdcProductName, isCommandFailedData, getEventType } from "./common.js";
