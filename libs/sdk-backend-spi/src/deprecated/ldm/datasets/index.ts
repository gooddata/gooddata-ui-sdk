// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Represents the current status of CSV source.
 * @deprecated Use {@link @gooddata/sdk-model#DatasetLoadStatus}
 * @public
 */
export type DatasetLoadStatus = m.DatasetLoadStatus;

/**
 * Object wrapping info about the user that created CSV load. Contains their login and full name.
 * @deprecated Use {@link @gooddata/sdk-model#IDatasetUser}
 * @public
 */
export interface IDatasetUser extends m.IDatasetUser {}

/**
 * Object wrapping basic information (owner, date created, status) about a CSV Load.
 * @deprecated Use {@link @gooddata/sdk-model#IDatasetLoadInfo}
 * @public
 */
export interface IDatasetLoadInfo extends m.IDatasetLoadInfo {}

/**
 * Represents type of LDM field created from the Dataset column.
 * @deprecated Use {@link @gooddata/sdk-model#DataColumnType}
 * @public
 */
export type DataColumnType = m.DataColumnType;

/**
 * Data column object interface.
 * @deprecated Use {@link @gooddata/sdk-model#IDataColumnBody}
 * @public
 */
export interface IDataColumnBody extends m.IDataColumnBody {}

/**
 * Dataset column with name, type and boolean flag whether the column
 * needs to be skipped while data loading or not.
 * @deprecated Use {@link @gooddata/sdk-model#IDataColumn}
 * @public
 */
export interface IDataColumn extends m.IDataColumn {}

/**
 * Structural information about CSV header and columns.
 *
 * @remarks
 * Indicates whether the CSV file contains header or not and on which row.
 * Also contains the list of CSV columns with their names and types.
 * @deprecated Use {@link @gooddata/sdk-model#IDataHeader}
 * @public
 */
export interface IDataHeader extends m.IDataHeader {}
/**
 * Dataset object interface.
 * @deprecated Use {@link @gooddata/sdk-model#IDatasetBody}
 * @public
 */
export interface IDatasetBody extends m.IDatasetBody {}

/**
 * Dataset describes a particular structure of dataset (CSV file).
 *
 * @remarks
 * There may be many Loads related to a single dataset - meaning multiple files with the same
 * structure and different data.
 * @deprecated Use {@link @gooddata/sdk-model#IDataset}
 * @public
 */
export interface IDataset extends m.IDataset {}
