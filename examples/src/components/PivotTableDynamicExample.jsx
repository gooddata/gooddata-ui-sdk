// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable, Table } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateAttributeCaliforniaUri,
    monthDateIdentifierJanuary
} from '../utils/fixtures';
import {
    createMeasureBucketItem,
    createAttributeBucketItem,
    createAttributeSortItem,
    createMeasureSortItem,
    createColumnTotal
} from '../utils/helpers';
import { ElementWithParam } from './utils/ElementWithParam';

const measureFranchiseFees = createMeasureBucketItem(franchiseFeesIdentifier);
const measureAdRoyalty = createMeasureBucketItem(franchiseFeesAdRoyaltyIdentifier);
const attributeLocationState = createAttributeBucketItem(locationStateDisplayFormIdentifier);
const attributeLocationName = createAttributeBucketItem(locationNameDisplayFormIdentifier);
const attributeMenuCategory = createAttributeBucketItem(menuCategoryAttributeDFIdentifier);
const attributeQuarter = createAttributeBucketItem(quarterDateIdentifier);
const attributeMonth = createAttributeBucketItem(monthDateIdentifier);

const measures = [measureFranchiseFees, measureAdRoyalty];
const columns = [attributeQuarter, attributeMonth];
const rows = [attributeLocationState, attributeLocationName, attributeMenuCategory];

const bucketPresets = {
    measures: {
        label: 'Measures',
        key: 'measures',
        bucketProps: {
            measures
        }
    },
    columnAttributes: {
        label: 'Column attributes',
        key: 'columnAttributes',
        bucketProps: {
            columns
        }
    },
    rowAttributes: {
        label: 'Row attributes',
        key: 'rowAttributes',
        bucketProps: {
            rows
        }
    },
    columnAndRowAttributes: {
        label: 'Column and row attributes',
        key: 'columnAndRowAttributes',
        bucketProps: {
            columns,
            rows
        }
    },
    measuresColumnAndRowAttributes: {
        label: 'Measures, column and row attributes',
        key: 'measuresColumnAndRowAttributes',
        bucketProps: {
            measures,
            columns,
            rows
        }
    },
    measuresAndColumnAttributes: {
        label: 'Measures and column attributes',
        key: 'measuresAndColumnAttributes',
        bucketProps: {
            measures,
            columns
        }
    },
    measuresAndRowAttributes: {
        label: 'Measures and row attributes',
        key: 'measuresAndRowAttributes',
        bucketProps: {
            measures,
            rows
        }
    },
    measuresAndMirroredAttributes: {
        label: 'Measures and mirrored attributes',
        key: 'measuresAndMirroredAttributes',
        bucketProps: {
            measures,
            rows,
            columns: rows.map(attribute => ({
                visualizationAttribute: {
                    ...attribute.visualizationAttribute,
                    localIdentifier: `${attribute.visualizationAttribute.localIdentifier}_2`
                }
            }))
        }
    }
};

const drillingPresets = {
    measure: {
        label: 'Measure Franchise Fees',
        key: 'measure',
        drillableItem: {
            identifier: franchiseFeesIdentifier
        }
    },
    attributeMonth: {
        label: 'Attribute Month',
        key: 'attributeMonth',
        drillableItem: {
            identifier: monthDateIdentifier
        }
    },
    attributeQuarter: {
        label: 'Attribute Quarter',
        key: 'attributeQuarter',
        drillableItem: {
            identifier: quarterDateIdentifier
        }
    },
    attributeLocationState: {
        label: 'Attribute Location state',
        key: 'attributeLocationState',
        drillableItem: {
            identifier: locationStateDisplayFormIdentifier
        }
    },
    attributeMenuCategory: {
        label: 'Attribute Menu category',
        key: 'attributeMenuCategory',
        drillableItem: {
            identifier: menuCategoryAttributeDFIdentifier
        }
    },
    attributeValueCalifornia: {
        label: 'Attribute value California',
        key: 'attributeValueCalifornia',
        drillableItem: {
            uri: locationStateAttributeCaliforniaUri
        }
    },
    attributeValueJanuary: {
        label: 'Attribute value January',
        key: 'attributeValueJanuary',
        drillableItem: {
            uri: monthDateIdentifierJanuary
        }
    }
};
const totalPresets = {
    franchiseFeesSum: {
        label: 'Franchise Fees Sum',
        key: 'franchiseFeesSum',
        totalItem: createColumnTotal(franchiseFeesIdentifier, locationStateDisplayFormIdentifier)
    },
    franchiseFeesAvg: {
        label: 'Franchise Fees Average',
        key: 'franchiseFeesAvg',
        totalItem: createColumnTotal(franchiseFeesIdentifier, locationStateDisplayFormIdentifier, 'avg')
    },
    franchiseFeesAdRoyaltySum: {
        label: 'Franchise Fees Ad Royalty Sum',
        key: 'franchiseFeesAdRoyaltySum',
        totalItem: createColumnTotal(franchiseFeesAdRoyaltyIdentifier, locationStateDisplayFormIdentifier)
    },
    franchiseFeesAdRoyaltyMax: {
        label: 'Franchise Fees Ad Royalty Max',
        key: 'franchiseFeesAdRoyaltyMax',
        totalItem: createColumnTotal(franchiseFeesAdRoyaltyIdentifier, locationStateDisplayFormIdentifier, 'max')
    }
};

const ASC = 'asc';
const DESC = 'desc';

const sortingPresets = {
    noSort: {
        label: 'No sort',
        key: 'noSort',
        sortBy: []
    },
    byMenuCategory: {
        label: 'By Menu Category ASC',
        key: 'byMenuCategory',
        sortBy: [createAttributeSortItem(menuCategoryAttributeDFIdentifier, ASC)]
    },
    byLocationState: {
        label: 'By Location State DESC',
        key: 'byLocationState',
        sortBy: [createAttributeSortItem(locationStateDisplayFormIdentifier, DESC)]
    },
    byQ1JanFranchiseFees: {
        label: 'by Q1 / Jan / FranchiseFees DESC',
        key: 'byQ1JanFranchiseFees',
        sortBy: [createMeasureSortItem(
            franchiseFeesIdentifier,
            DESC,
            [
                quarterDateIdentifier, '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1',
                monthDateIdentifier, '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
            ]
        )]
    },
    byLocationStateAndQ1JanFranchiseFees: {
        label: 'By Location State ASC And Q1 Jan Franchise Fees DESC',
        key: 'byLocationStateAndQ1JanFranchiseFees',
        sortBy: [
            createAttributeSortItem(locationStateDisplayFormIdentifier, ASC),
            createMeasureSortItem(
                franchiseFeesIdentifier,
                DESC,
                [
                    quarterDateIdentifier, '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2009/elements?id=1',
                    monthDateIdentifier, '/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2071/elements?id=1'
                ]
            )
        ]
    }
};

export const getDrillableItems = (drillableKeys) => {
    return Object.keys(drillableKeys)
        .filter(itemKey => drillableKeys[itemKey])
        .map(itemKey => drillingPresets[itemKey].drillableItem);
};

export const getTotalItems = (totalKeys) => {
    return Object.keys(totalKeys)
        .filter(itemKey => totalKeys[itemKey])
        .map(itemKey => totalPresets[itemKey].totalItem);
};

export class PivotTableDrillingExample extends Component {
    constructor(props) {
        super(props);
        const drillingPresetKeys = {
            attributeValueCalifornia: true,
            measure: true,
            attributeMenuCategory: true,
            attributeValueJanuary: true
        };
        const totalPresetKeys = {};
        this.state = {
            bucketPresetKey: 'measuresColumnAndRowAttributes',
            drillEvent: null,
            drillingPresetKeys,
            drillableItems: getDrillableItems(drillingPresetKeys),
            totalPresetKeys,
            sortingPresetKey: 'noSort'
        };
        this.onDrillingPresetChange = this.onDrillingPresetChange.bind(this);
        this.onTotalPresetChange = this.onTotalPresetChange.bind(this);
        this.onBucketPresetChange = this.onBucketPresetChange.bind(this);
        this.onSortingPresetChange = this.onSortingPresetChange.bind(this);
    }

    onDrillingPresetChange(drillingPresetKey) {
        const drillingPresetKeys = {
            ...this.state.drillingPresetKeys,
            [drillingPresetKey]: !this.state.drillingPresetKeys[drillingPresetKey]
        };
        this.setState({
            drillingPresetKeys,
            drillableItems: getDrillableItems(drillingPresetKeys)
        });
    }
    onTotalPresetChange(totalPresetKey) {
        const totalPresetKeys = {
            ...this.state.totalPresetKeys,
            [totalPresetKey]: !this.state.totalPresetKeys[totalPresetKey]
        };
        this.setState({
            totalPresetKeys
        });
    }

    onBucketPresetChange(bucketPresetKey) {
        this.setState({
            bucketPresetKey
        });
    }

    onSortingPresetChange(sortingPresetKey) {
        this.setState({
            sortingPresetKey
        });
    }

    onDrill = (drillEvent) => {
        // eslint-disable-next-line no-console
        console.log('onFiredDrillEvent', drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent
        });
        return true;
    }

    render() {
        const {
            bucketPresetKey,
            sortingPresetKey,
            drillEvent,
            drillableItems,
            drillingPresetKeys,
            totalPresetKeys
        } = this.state;
        const { bucketProps } = bucketPresets[bucketPresetKey];
        const { sortBy } = sortingPresets[sortingPresetKey];

        const tableBucketProps = {
            ...bucketProps
        };
        delete tableBucketProps.columns;
        if (bucketProps.rows) {
            tableBucketProps.attributes = bucketProps.rows;
        }

        const totals = getTotalItems(totalPresetKeys);

        return (
            <div>
                <style jsx>{`
                    .presets {
                        margin: -5px;
                        margin-top: 0;
                        margin-bottom: 10px;
                    }
                    .presets :global(.preset-option) {
                        margin: 5px;
                    }
              `}</style>
                <div className="presets">
                    Data presets: {
                        Object.keys(bucketPresets).map((presetItemKey) => {
                            const { key, label } = bucketPresets[presetItemKey];
                            return (
                                <ElementWithParam
                                    key={key}
                                    className={`preset-option button button-secondary s-bucket-preset-${key} ${bucketPresetKey === key ? ' is-active' : ''}`}
                                    onClick={this.onBucketPresetChange}
                                    params={[key]}
                                >
                                    {label}
                                </ElementWithParam>
                            );
                        })
                    }
                </div>
                <div className="presets">
                    Drilling presets: {
                        Object.keys(drillingPresets).map((presetItemKey) => {
                            const { key, label } = drillingPresets[presetItemKey];
                            return (<ElementWithParam
                                key={key}
                                className={`preset-option button button-secondary s-drilling-preset-${key} ${drillingPresetKeys[key] ? ' is-active' : ''}`}
                                onClick={this.onDrillingPresetChange}
                                params={[key]}
                            >{label}</ElementWithParam>);
                        })
                    }
                </div>
                <div className="presets">
                    Sorting presets: {
                        Object.keys(sortingPresets).map((presetItemKey) => {
                            const { key, label } = sortingPresets[presetItemKey];
                            return (<ElementWithParam
                                key={key}
                                className={`preset-option button button-secondary s-sorting-preset-${key} ${sortingPresetKey === key ? ' is-active' : ''}`}
                                onClick={this.onSortingPresetChange}
                                params={[key]}
                            >{label}</ElementWithParam>);
                        })
                    }
                </div>
                <div className="presets">
                    Total presets: {
                        Object.keys(totalPresets).map((presetItemKey) => {
                            const { key, label } = totalPresets[presetItemKey];
                            return (<ElementWithParam
                                key={key}
                                className={`preset-option button button-secondary s-total-preset-${key} ${totalPresetKeys[key] ? ' is-active' : ''}`}
                                onClick={this.onTotalPresetChange}
                                params={[key]}
                            >{label}</ElementWithParam>);
                        })
                    }
                </div>
                <div style={{ height: 300 }} className={`s-pivot-table-${bucketPresetKey}`} >
                    <PivotTable
                        projectId={projectId}
                        pageSize={20}
                        {...bucketProps}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                        sortBy={sortBy}
                        totals={totals}
                    />
                </div>
                <h2>Table component for reference</h2>
                <div style={{ height: 300 }} >
                    <Table
                        projectId={projectId}
                        {...tableBucketProps}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                        sortBy={sortBy}
                        totals={totals}
                    />
                </div>
                <pre className="s-output">
                    {JSON.stringify(drillEvent || {
                        ...bucketProps,
                        drillableItems
                    }, null, 4)}
                </pre>
            </div>
        );
    }
}

export default PivotTableDrillingExample;
