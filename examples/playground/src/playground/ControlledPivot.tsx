import React, { useState, CSSProperties, useMemo } from 'react';
import { IMeasure, IAttribute, modifyAttribute, modifyMeasure, ISortItem, newMeasureSort, sortDirection, newAttributeLocator } from '@gooddata/sdk-model';
import { IPivotTableConfig, PivotTable } from '@gooddata/sdk-ui-pivot';
import * as Md from '../md/full';

const measures: IMeasure[] = [
    modifyMeasure(Md.Amount, (m) => m.localId("m1").alias("Amount")),
    modifyMeasure(Md.DaysToClose.Sum, (m) => m.localId("m2").alias("Days to close").format("#,##0.00")),
]
const department = modifyAttribute(Md.DepartmentLongNameUsedToShowTooltip, (a) => a.localId("a1").alias("Department"));
const closed = modifyAttribute(Md.IsClosed, (a) => a.localId("a2").alias("Is Closed?"));

const rows: IAttribute[] =[
    department,
    closed
]

const product = modifyAttribute(Md.Product.Default, (a) => a.localId("a3").alias("Product"));
const region = modifyAttribute(Md.Region, (a) => a.localId("a4").alias("Region"));

const columns: IAttribute[] = [
    product, region
];

const pivotWrapper: CSSProperties = {
    width: 1000,
    height: 300,
};

const pivotConfig: IPivotTableConfig = {
    columnSizing: {
        defaultWidth: "autoresizeAll"
    },menu: {
        aggregations: true,
        aggregationsSubMenuForRows: true,
    },
};

interface Item {
    id: string;
    name: string;
}

const CheckboxItem: React.FC<{ item: Item; isChecked: boolean; onChange: () => void }> = ({
    item,
    isChecked,
    onChange,
}) => {
    return (
        <td>
            <label>
                <input type="checkbox" checked={isChecked} onChange={onChange} />
                <b>{item.id}</b>: {item.name}
            </label>
        </td>
    );
};

const firstDepartment = "/gdc/md/auiwj6pa2cs3twpjr98gtjfb34x3i0gv/obj/1026/elements?id=1226";
const firstProduct = "/gdc/md/auiwj6pa2cs3twpjr98gtjfb34x3i0gv/obj/949/elements?id=168279";

const firstElements = {
    [department.attribute.localIdentifier]: firstDepartment,
    [product.attribute.localIdentifier]: firstProduct,
}

export const ControlledPivot: React.FC = () => {
    const [selectedRows, setSelectedRows] = useState<string[]>(["a1"]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(["a3"]);
    const [selectedMeasures, setSelectedMeasures] = useState<string[]>(["m1", "m2"]);
    const [measuresDimension, setMeasuresDimension] = useState<"rows" | "columns">("rows");
    const [isTransposed, setTransposed] = useState<boolean>(false);

    const [sorts, setSorts] = useState<Array<ISortItem>>([]);

    const handleCheckboxChange = (item: Item, listName: string) => {
        switch (listName) {
            case 'rows':
                setSelectedRows((prevSelectedRows) =>
                    prevSelectedRows.includes(item.id)
                        ? prevSelectedRows.filter((id) => id !== item.id)
                        : [...prevSelectedRows, item.id]
                );
                break;
            case 'columns':
                setSelectedColumns((prevSelectedColumns) =>
                    prevSelectedColumns.includes(item.id)
                        ? prevSelectedColumns.filter((id) => id !== item.id)
                        : [...prevSelectedColumns, item.id]
                );
                break;
            case 'measures':
                setSelectedMeasures((prevSelectedMeasures) =>
                    prevSelectedMeasures.includes(item.id)
                        ? prevSelectedMeasures.filter((id) => id !== item.id)
                        : [...prevSelectedMeasures, item.id]
                );
                break;
            default:
                break;
        }
    };

    const CheckboxItemList: React.FC<{
        items: Item[];
        isChecked: (id: string) => boolean;
        listName: string;
    }> = ({ items, isChecked, listName }) => {
        return (
            <>
                {items.map((item) => (
                    <CheckboxItem
                        key={item.id}
                        item={item}
                        isChecked={isChecked(item.id)}
                        onChange={() => handleCheckboxChange(item, listName)}
                    />
                ))}
            </>
        );
    };

    const rowsIds = useMemo(() => rows.map((row) => ({
        id: row.attribute.localIdentifier,
        name: row.attribute.alias!
    })), [rows]);
    const columnIds = useMemo(() => columns.map((column) => ({
        id: column.attribute.localIdentifier,
        name: column.attribute.alias!
    })), [columns]);
    const measureIds = useMemo(() => measures.map((measure) => ({
        id: measure.measure.localIdentifier,
        name: measure.measure.alias!
    })), [measures]);

    const currentRows = useMemo(() => rows.filter((row) => selectedRows.includes(row.attribute.localIdentifier)), [rows, selectedRows]);
    const currentColumns = useMemo(() => columns.filter((column) => selectedColumns.includes(column.attribute.localIdentifier)), [columns, selectedColumns]);
    const currentMeasures = useMemo(() => measures.filter((measure) => selectedMeasures.includes(measure.measure.localIdentifier)), [measures, selectedMeasures]);

    const currentPivotConfig = useMemo(() => ({
        ...pivotConfig,
        measureGroupDimension: measuresDimension,
    }), [pivotConfig, measuresDimension]);

    const onMeasureDimensionSwitch = () => setMeasuresDimension(measuresDimension === "rows" ? "columns" : "rows");

    const onSortAdd = (sortType: string) => {
        const direction = sorts[0] ? sortDirection(sorts[0]): "asc";
        if(sortType === "rows") {
            const elementId = firstElements[currentRows[0].attribute.localIdentifier];
            if(elementId) {
                setSorts([newMeasureSort(currentMeasures[0], direction === "asc" ? "desc" : "asc", [newAttributeLocator(currentRows[0], elementId)])]);
            } else {
                setSorts([]);
            }
        } else {
            const elementId = firstElements[currentColumns[0].attribute.localIdentifier];
            if(elementId) {
                setSorts([newMeasureSort(currentMeasures[0], direction === "asc" ? "desc" : "asc", [newAttributeLocator(currentColumns[0], elementId)])]);
            } else {
                setSorts([]);
            }
        }
    }
    return (
        <div>
            <div className="control-panel">
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th colSpan={2} className="header">Attributes</th>
                        <th colSpan={2} className="header">Measures</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="header">Rows</td>
                        <CheckboxItemList
                            items={isTransposed ? columnIds : rowsIds}
                            isChecked={(id) => isTransposed ? selectedColumns.includes(id) : selectedRows.includes(id)}
                            listName={isTransposed ? "columns" : "rows"}
                        />
                        {measuresDimension === "rows" && <CheckboxItemList
                            items={measureIds}
                            isChecked={(id) => selectedMeasures.includes(id)}
                            listName="measures"
                        />}
                    </tr>
                    <tr>
                        <td className="header">Columns</td>
                        <CheckboxItemList
                            items={isTransposed ? rowsIds : columnIds}
                            isChecked={(id) => isTransposed ? selectedRows.includes(id) : selectedColumns.includes(id)}
                            listName={isTransposed ? "rows" : "columns"}
                        />
                        {measuresDimension === "columns" && <CheckboxItemList
                            items={measureIds}
                            isChecked={(id) => selectedMeasures.includes(id)}
                            listName="measures"
                        />}
                    </tr>
                    </tbody>
                </table>
                <div className="buttons">
                    <button type="button" onClick={() => setTransposed(!isTransposed)}>
                        Switch rows for columns
                    </button>
                    <button type="button" onClick={onMeasureDimensionSwitch}>
                        Switch measures dimension
                    </button>
                    {measuresDimension === "rows" ?
                        (<button type="button" onClick={() => onSortAdd(measuresDimension)}>
                            Add row sort
                        </button>):(
                        <button type="button" onClick={() => onSortAdd(measuresDimension)}>
                            Add column sort
                        </button>)
                    }
                </div>
            </div>
            <div style={pivotWrapper}>
                <PivotTable
                    measures={currentMeasures}
                    rows={isTransposed ? currentColumns : currentRows}
                    columns={isTransposed ? currentRows : currentColumns}
                    config={currentPivotConfig}
                    sortBy={sorts}
                />
            </div>
        </div>
    );
};


