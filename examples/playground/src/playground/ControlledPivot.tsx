import React, { useState, CSSProperties, useMemo } from 'react';
import { IMeasure, IAttribute } from '@gooddata/sdk-model';
import { IPivotTableConfig, PivotTable } from '@gooddata/sdk-ui-pivot';

const measures: IMeasure[] = [
    {
        measure: {
            localIdentifier: "m1",
            alias: "Amount",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1246",
                    }
                }
            }
        }
    },
    {
        measure: {
            localIdentifier: "m2",
            format: "#,##0.00",
            alias: "Days to close",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1101",
                    },
                    aggregation: "sum",
                },
            },
        }
    }
];

const rows: IAttribute[] = [
    {
        attribute: {
            localIdentifier: "a1",
            alias: "Department",
            displayForm: {
                uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1086",
            }
        }
    },
    {
        attribute: {
            localIdentifier: "a2",
            alias: "Is Closed?",
            displayForm: {
                uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1092",
            }
        }
    }
];

const columns: IAttribute[] = [
    {
        attribute: {
            localIdentifier: "a3",
            alias: "Product",
            displayForm: {
                uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1052",
            }
        }
    },
    {
        attribute: {
            localIdentifier: "a4",
            alias: "Region",
            displayForm: {
                uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1084",
            }
        }
    }
];

const pivotWrapper: CSSProperties = {
    width: 1000,
    height: 300,
};

const pivotConfig: IPivotTableConfig = {
    columnSizing: {
        defaultWidth: "autoresizeAll"
    }
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

export const ControlledPivot: React.FC = () => {
    const [selectedRows, setSelectedRows] = useState<string[]>(["a1"]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(["a3"]);
    const [selectedMeasures, setSelectedMeasures] = useState<string[]>(["m1", "m2"]);
    const [measuresDimension, setMeasuresDimension] = useState<"rows" | "columns">("rows");
    const [isTransposed, setTransposed] = useState<boolean>(false);

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
                </div>
            </div>
            <div style={pivotWrapper}>
                <PivotTable
                    measures={currentMeasures}
                    rows={isTransposed ? currentColumns : currentRows}
                    columns={isTransposed ? currentRows : currentColumns}
                    config={currentPivotConfig}
                />
            </div>
        </div>
    );
};


