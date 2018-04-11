// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';
import { wrap } from '../utils/wrap';
import Headline from '../../src/components/visualizations/headline/Headline';
import '../../styles/scss/headline.scss';

storiesOf('Internal/Headline', module)
    .add('One measure', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '42225.01',
                            title: 'Sum of Clicks'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    )
    .add('Two measures', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '42225.01',
                            title: 'Sum of Clicks'
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: '32225.01',
                            title: 'Sum of Taps'
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: '0.9',
                            title: 'Versus',
                            format: '#,##0%'
                        }

                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    )
    .add('Invalid value - default formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: 'invalid-value',
                            title: 'Sum of Clicks'
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: 'invalid-value',
                            title: 'Sum of Taps',
                            format: '[color=9c46b5][backgroundColor=d2ccde]$#,##0.00 group'
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: 'invalid-value',
                            title: 'Versus',
                            format: '#,##0%'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    )
    .add('Invalid value - custom formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: null,
                            title: 'Sum of Clicks',
                            format: '[=null]EMPTY'
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: null,
                            title: 'Sum of Taps',
                            format: '[=null]EMPTY'
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: null,
                            title: 'Versus',
                            format: '#,##0%'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 300)
        )
    )
    .add('Formatted', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '666429.405',
                            format: '[color=9c46b5][backgroundColor=d2ccde]$#,##0.00 group',
                            title: 'Yearly Earnings',
                            isDrillable: false
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: '32225.01',
                            title: 'Sum of Taps',
                            format: '[color=9c46b5][backgroundColor=d2ccde]$#,##0.00 group'
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: '0.9',
                            title: 'Versus',
                            format: '#,##0%'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                'auto', 475)
        )
    );

storiesOf('Internal/Headline/Drilldown eventing', module)
    .add('One measure', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '53336',
                            format: '#,##0.00',
                            title: 'Sum of Clicks',
                            isDrillable: true
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                'auto', 300)
        )
    )
    .add('Two measures', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '42225.01',
                            title: 'Sum of Clicks',
                            isDrillable: true
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: '32225.01',
                            title: 'Sum of Taps',
                            isDrillable: true
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: '0.9',
                            title: 'Versus',
                            format: '#,##0%'
                        }

                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                'auto', 300)
        )
    )
    .add('Two measures - custom formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: '42225.01',
                            title: 'Sum of Clicks',
                            format: '[color=9c46b5]$#,##0.00 group',
                            isDrillable: true
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: '32225.01',
                            title: 'Sum of Taps',
                            format: '[color=9c46b5]$#,##0.00 group',
                            isDrillable: true
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: '0.9',
                            title: 'Versus',
                            format: '#,##0%'
                        }

                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                'auto', 300)
        )
    )
    .add('Invalid values', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: null,
                            title: 'Sum of Clicks',
                            isDrillable: true
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: null,
                            title: 'Sum of Taps',
                            isDrillable: true
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: null,
                            title: 'Versus',
                            format: '#,##0%'
                        }

                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                'auto', 300)
        )
    )
    .add('Invalid values - Custom formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'm1',
                            value: null,
                            format: '[=null]EMPTY',
                            title: 'Sum of Clicks',
                            isDrillable: true
                        },
                        secondaryItem: {
                            localIdentifier: 'm2',
                            value: null,
                            format: '[=null]EMPTY',
                            title: 'Sum of Taps',
                            isDrillable: true
                        },
                        tertiaryItem: {
                            localIdentifier: 'tertiaryIdentifier',
                            value: null,
                            title: 'Versus',
                            format: '#,##0%'
                        }

                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                'auto', 300)
        )
    );
