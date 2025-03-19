// (C) 2023-2024 GoodData Corporation

import React from "react";
import { invariant } from "ts-invariant";

/**
 * @internal
 */
export type TelemetryEvent =
    | "multiple-users-deleted"
    | "multiple-groups-deleted"
    | "group-deleted"
    | "user-deleted"
    | "group-created"
    | "user-detail-updated"
    | "group-detail-updated"
    | "groups-added-to-single-user"
    | "groups-added-to-multiple-users"
    | "users-added-to-single-group"
    | "users-added-to-multiple-groups"
    | "permission-added-to-single-user"
    | "permission-added-to-single-group"
    | "permission-added-to-multiple-users"
    | "permission-added-to-multiple-groups"
    | "user-permission-changed-to-hierarchy"
    | "user-permission-changed-to-single-workspace"
    | "group-permission-changed-to-hierarchy"
    | "group-permission-changed-to-single-workspace"
    | "user-permission-changed-to-view"
    | "group-permission-changed-to-view"
    | "user-permission-changed-to-view-save-views"
    | "group-permission-changed-to-view-save-views"
    | "user-permission-changed-to-view-export"
    | "group-permission-changed-to-view-export"
    | "user-permission-changed-to-view-export-save-views"
    | "group-permission-changed-to-view-export-save-views"
    | "user-permission-changed-to-analyze"
    | "group-permission-changed-to-analyze"
    | "user-permission-changed-to-analyze-export"
    | "group-permission-changed-to-analyze-export"
    | "user-permission-changed-to-manage"
    | "group-permission-changed-to-manage"
    | "user-data-source-permission-changed-to-use"
    | "group-data-source-permission-changed-to-use"
    | "user-data-source-permission-changed-to-manage"
    | "group-data-source-permission-changed-to-manage"
    | "user-role-changed-to-admin"
    | "user-role-changed-to-member";

/**
 * @internal
 */
export type TrackEventCallback = (event: TelemetryEvent) => void;

const TelemetryContext = React.createContext<TrackEventCallback | undefined>(undefined);
TelemetryContext.displayName = "TelemetryContext";

export interface ITelemetryProviderProps {
    trackEvent?: TrackEventCallback;
    children?: React.ReactNode;
}

export const TelemetryProvider: React.FC<ITelemetryProviderProps> = ({ trackEvent, children }) => {
    return <TelemetryContext.Provider value={trackEvent}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => {
    const trackEvent = React.useContext(TelemetryContext);
    invariant(trackEvent, "useTelemetry must be called in TelemetryContext with initialized value!");
    return trackEvent;
};

/**
 * @internal
 */
export interface IWithTelemetryProps {
    onEvent: TrackEventCallback;
}

export function withTelemetry<T extends IWithTelemetryProps>(WrappedComponent: React.ComponentType<T>) {
    const ResultComponent: React.FC<T> = (props) => {
        return (
            <TelemetryProvider trackEvent={props.onEvent}>
                <WrappedComponent {...props} />
            </TelemetryProvider>
        );
    };
    ResultComponent.displayName = WrappedComponent.displayName;
    return ResultComponent;
}
