// (C) 2021-2024 GoodData Corporation
import React, { useMemo } from "react";

import { sortByName } from "../utils.js";
import { IGrantedDataSource, ListMode, WorkspacePermissionSubject } from "../types.js";

import { DataSourceItem } from "./DataSourceItem.js";
import { DataSourceListEmpty } from "./DataSourceListEmpty.js";

export interface IDataSourceListProps {
    dataSources: IGrantedDataSource[];
    subjectType: WorkspacePermissionSubject;
    mode: ListMode;
    onDelete: (workspace: IGrantedDataSource) => void;
    onChange?: (workspace: IGrantedDataSource) => void;
    renderDataSourceIcon: (dataSource: IGrantedDataSource) => JSX.Element;
}

export const DataSourceList: React.FC<IDataSourceListProps> = ({
    dataSources,
    subjectType,
    mode,
    onChange,
    onDelete,
    renderDataSourceIcon,
}) => {
    const sortedDataSources = useMemo(() => {
        return dataSources ? [...dataSources].sort(sortByName) : [];
    }, [dataSources]);

    if (sortedDataSources.length === 0) {
        return <DataSourceListEmpty mode={mode} subjectType={subjectType} />;
    }

    return (
        <div className="gd-share-dialog-grantee-list s-user-management-data-sources">
            {sortedDataSources.map((dataSource) => {
                return (
                    <DataSourceItem
                        key={dataSource.id}
                        dataSource={dataSource}
                        subjectType={subjectType}
                        onChange={onChange}
                        onDelete={onDelete}
                        renderDataSourceIcon={renderDataSourceIcon}
                    />
                );
            })}
        </div>
    );
};
