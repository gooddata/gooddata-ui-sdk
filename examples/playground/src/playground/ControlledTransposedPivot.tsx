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

const columns: IAttribute[] = [
    {
        attribute: {
            localIdentifier: "a1",
            alias: "Product",
            displayForm: {
                uri: "/gdc/md/ev8aavapbex39vvlnbfebi7wkc8faqgm/obj/1052",
            }
        }
    },
    {
        attribute: {
            localIdentifier: "a2",
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

export const ControlledTransposedPivot: React.FC = () => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>(["a2"]);
    const [selectedMeasures, setSelectedMeasures] = useState<string[]>(["m1", "m2"]);
    const [isTransposed, setTransposed] = useState<boolean>(true);

    const handleCheckboxChange = (item: Item, listName: string) => {
        switch (listName) {
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

    const columnIds = useMemo(() => columns.map((column) => ({
        id: column.attribute.localIdentifier,
        name: column.attribute.alias!
    })), [columns]);
    const measureIds = useMemo(() => measures.map((measure) => ({
        id: measure.measure.localIdentifier,
        name: measure.measure.alias!
    })), [measures]);

    const currentColumns = useMemo(() => columns.filter((column) => selectedColumns.includes(column.attribute.localIdentifier)), [columns, selectedColumns]);
    const currentMeasures = useMemo(() => measures.filter((measure) => selectedMeasures.includes(measure.measure.localIdentifier)), [measures, selectedMeasures]);

    const currentPivotConfig = useMemo(() => ({
        ...pivotConfig,
        headersPosition: isTransposed ? "left" as const : "top" as const,
        measureGroupDimension: isTransposed ? "rows" as const : "columns" as const,
    }), [pivotConfig, isTransposed]);

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
                        {isTransposed && (<>
                            <td></td>
                            <td></td>
                            <CheckboxItemList
                                items={measureIds}
                                isChecked={(id) => selectedMeasures.includes(id)}
                                listName="measures"
                            /></>)}
                    </tr>
                    <tr>
                        <td className="header">Columns</td>
                        <CheckboxItemList
                            items={columnIds}
                            isChecked={(id) => selectedColumns.includes(id)}
                            listName={"columns"}
                        />
                        {!isTransposed && <CheckboxItemList
                            items={measureIds}
                            isChecked={(id) => selectedMeasures.includes(id)}
                            listName="measures"
                        />}
                    </tr>
                    </tbody>
                </table>
                <div className="buttons">
                    <button type="button" onClick={() => setTransposed(!isTransposed)}>
                        Switch headers position
                    </button>
                </div>
            </div>
            <div style={pivotWrapper}>
                <PivotTable
                    measures={currentMeasures}
                    columns={currentColumns}
                    config={currentPivotConfig}
                />
            </div>
        </div>
    );
};


