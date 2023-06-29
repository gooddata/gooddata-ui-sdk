// (C) 2007-2022 GoodData Corporation

import * as EmbeddedAnalyticalDesigner from "./EmbeddedAnalyticalDesigner.js";
import * as EmbeddedGdc from "./EmbeddedGdc.js";
import * as EmbeddedKpiDashboard from "./EmbeddedKpiDashboard.js";

/**
 * @public
 */
export { EmbeddedGdc };

/**
 * All interface, types, type-guard related to embedded Analytical Designer
 *
 * @public
 */
export { EmbeddedAnalyticalDesigner };

/**
 * All interface, types, type-guard related to embedded KPI Dashboards
 *
 * @public
 */
export { EmbeddedKpiDashboard };

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
