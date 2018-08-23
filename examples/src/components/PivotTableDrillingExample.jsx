// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { PivotTable, Table } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import {
    projectId,
    yearDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateAttributeCaliforniaUri,
    monthDateIdentifierJanuary
} from '../utils/fixtures';
import { createMeasureBucketItem, createAttributeBucketItem } from '../utils/helpers';

const measureFranchiseFees = createMeasureBucketItem(franchiseFeesIdentifier);
const measureAdRoyalty = createMeasureBucketItem(franchiseFeesAdRoyaltyIdentifier);
const attributeLocationState = createAttributeBucketItem(locationStateDisplayFormIdentifier);
const attributeLocationName = createAttributeBucketItem(locationNameDisplayFormIdentifier);
const attributeMenuCategory = createAttributeBucketItem(menuCategoryAttributeDFIdentifier);
const attributeYear = createAttributeBucketItem(yearDateIdentifier);
const attributeMonth = createAttributeBucketItem(monthDateIdentifier);

const measures = [measureFranchiseFees, measureAdRoyalty];
const columns = [attributeYear, attributeMonth];
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
    attributeYear: {
        label: 'Attribute Year',
        key: 'attributeYear',
        drillableItem: {
            identifier: yearDateIdentifier
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

export class PivotTableDrillingExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bucketPresetKey: 'measuresColumnAndRowAttributes',
            drillEvent: null,
            drillingPresetKeys: {
                attributeValueCalifornia: true,
                measure: true,
                attributeMenuCategory: true,
                attributeValueJanuary: true
            }
        };
    }

    onDrillingPresetChange = drillingPresetKey => () => (
        this.setState({
            drillingPresetKeys: {
                ...this.state.drillingPresetKeys,
                [drillingPresetKey]: !this.state.drillingPresetKeys[drillingPresetKey]
            }
        })
    )

    onBucketPresetChange = bucketPresetKey => () => (
        this.setState({
            bucketPresetKey
        })
    )

    onDrill = (drillEvent) => {
        // eslint-disable-next-line no-console
        console.log('onFiredDrillEvent', drillEvent, JSON.stringify(drillEvent.drillContext.intersection, null, 2));
        this.setState({
            drillEvent
        });
    }

    render() {
        const { bucketPresetKey, drillingPresetKeys, drillEvent } = this.state;
        const { bucketProps } = bucketPresets[bucketPresetKey];

        const drillableItems = Object.keys(drillingPresetKeys)
            .filter(drillingPresetKey => drillingPresetKeys[drillingPresetKey])
            .map(drillingPresetKey => drillingPresets[drillingPresetKey].drillableItem);

        const tableBucketProps = {
            ...bucketProps
        };
        delete tableBucketProps.columns;
        if (bucketProps.rows) {
            tableBucketProps.attributes = bucketProps.rows;
        }

        return (
            <div>
                <style jsx>{`
                    .presets {
                        margin: -5px;
                        margin-top: 0;
                        margin-bottom: 10px;
                    }
                    .preset-option {
                        margin: 5px;
                    }
              `}</style>
                <div className="presets">
                    Data presets: {
                        Object.keys(bucketPresets).map((presetItemKey) => {
                            const { key, label } = bucketPresets[presetItemKey];
                            return (<button
                                key={key}
                                className={`preset-option button button-secondary s-bucket-preset-${key} ${bucketPresetKey === key ? ' is-active' : ''}`}
                                onClick={this.onBucketPresetChange(key)}
                            >{label}</button>);
                        })
                    }
                </div>
                <div className="presets">
                    Drilling presets: {
                        Object.keys(drillingPresets).map((presetItemKey) => {
                            const { key, label } = drillingPresets[presetItemKey];
                            return (<button
                                key={key}
                                className={`preset-option button button-secondary s-drilling-preset-${key} ${drillingPresetKeys[key] ? ' is-active' : ''}`}
                                onClick={this.onDrillingPresetChange(key)}
                            >{label}</button>);
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
                    />
                </div>
                <div style={{ height: 300 }} >
                    <Table
                        projectId={projectId}
                        {...tableBucketProps}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
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
