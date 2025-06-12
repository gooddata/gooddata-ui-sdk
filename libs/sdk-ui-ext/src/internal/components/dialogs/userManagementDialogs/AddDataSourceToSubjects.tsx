// (C) 2023-2024 GoodData Corporation

import React from "react";
import { IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { AddDataSource } from "./DataSources/AddDataSource.js";
import { IGrantedDataSource, DataSourcePermissionSubject } from "./types.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];
const noGrantedDataSources: IGrantedDataSource[] = [];

/**
 * @internal
 */
export interface IAddDataSourceToSubjectsProps extends IWithTelemetryProps {
    ids: string[];
    subjectType: DataSourcePermissionSubject;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
    renderDataSourceIcon?: (dataSource: IGrantedDataSource) => JSX.Element;
}

const AddDataSourceToSubjectsComponent: React.FC<IAddDataSourceToSubjectsProps> = ({
    ids,
    subjectType,
    organizationId,
    onSuccess,
    onClose,
    renderDataSourceIcon,
}) => {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal={true} positionType="fixed">
                <AddDataSource
                    ids={ids}
                    subjectType={subjectType}
                    grantedDataSources={noGrantedDataSources}
                    enableBackButton={false}
                    onSubmit={onSuccess}
                    onCancel={onClose}
                    onClose={onClose}
                    renderDataSourceIcon={renderDataSourceIcon}
                />
            </Overlay>
        </OrganizationIdProvider>
    );
};

/**
 * @internal
 */
export const AddDataSourceToSubjects = withTelemetry(AddDataSourceToSubjectsComponent);
