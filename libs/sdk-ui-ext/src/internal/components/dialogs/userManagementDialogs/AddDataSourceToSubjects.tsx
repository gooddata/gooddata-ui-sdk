// (C) 2023-2025 GoodData Corporation

import { ReactElement } from "react";

import { IAlignPoint, Overlay } from "@gooddata/sdk-ui-kit";

import { AddDataSource } from "./DataSources/AddDataSource.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";
import { DataSourcePermissionSubject, IGrantedDataSource } from "./types.js";

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
    renderDataSourceIcon?: (dataSource: IGrantedDataSource) => ReactElement;
}

function AddDataSourceToSubjectsComponent({
    ids,
    subjectType,
    organizationId,
    onSuccess,
    onClose,
    renderDataSourceIcon,
}: IAddDataSourceToSubjectsProps) {
    return (
        <OrganizationIdProvider organizationId={organizationId}>
            <Overlay alignPoints={alignPoints} isModal positionType="fixed">
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
}

/**
 * @internal
 */
export const AddDataSourceToSubjects = withTelemetry(AddDataSourceToSubjectsComponent);
