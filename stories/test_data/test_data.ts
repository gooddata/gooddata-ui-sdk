// (C) 2007-2018 GoodData Corporation
export const pieChart: any = {
    isLoaded: true,
    headers: [{
        type: 'attrLabel',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Year (Closed)'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: 'aaa <b># of Open Opps.',
        format: '#,##0.00'
    }],
    rawData: [
        [
            {
                id: '2010',
                name: '2010'
            },
            '30'
        ],
        [
            {
                id: '2011',
                name: '2011'
            },
            '174'
        ],
        [
            {
                id: '2012',
                name: '2012'
            },
            '735'
        ],
        [
            {
                id: '2013',
                name: '2013'
            },
            '74'
        ],
        [
            {
                id: '2014',
                name: '2014'
            },
            '4'
        ],
        [
            {
                id: '2016',
                name: '2016 <button>Frantiska</button>'
            },
            '18'
        ],
        [
            {
                id: '2017',
                name: '2017'
            },
            '58'
        ]
    ],
    isLoading: false
};

export const pieChartWithEmpty: any = {
    isLoaded: true,
    headers: [{
        type: 'attrLabel',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Year (Closed)'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: 'Sum of Amount',
        format: '#,##0.00'
    }],
    rawData: [
        [
            { id: '2010', name: '2010' }, '1788281519.44'
        ],
        [
            { id: '2011', name: '2011' }, '2849965878.5'
        ],
        [
            { id: '2012', name: '2012' }, '930234910.69'
        ],
        [
            { id: '2013', name: '2013' }, '48591716.69'
        ],
        [
            { id: '2014', name: '2014' }, '777735.4'
        ],
        [
            { id: '2016', name: '2016' }, null
        ],
        [
            { id: '2017', name: '2017' }, '61948'
        ]
    ],
    isLoading: false
};

export const singleMetricPieCart = {
    isLoaded: true,
    headers: [{
        type: 'metric',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Products sold'
    }],
    rawData: [
        [
            '267'
        ]
    ],
    isLoading: false
};

export const metricsOnlyPieChart = {
    isLoaded: true,
    headers: [{
        type: 'metric',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Products sold'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: 'aaa <b># of Open Opps.</b>',
        format: '<button>#,##0.00</button>'
    }, {
        type: 'metric',
        id: 'aaYh6Vouasd2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13468',
        title: 'Sum of Amount',
        format: '#,##0.00'
    }],
    rawData: [
        [
            '267',
            '30',
            '64'
        ]
    ],
    isLoading: false
};

export const metricsOnlyPieChartDrillableItems = [
    {
        uri: metricsOnlyPieChart.headers[0].uri,
        identifier: metricsOnlyPieChart.headers[0].id
    }, {
        uri: metricsOnlyPieChart.headers[2].uri,
        identifier: metricsOnlyPieChart.headers[2].id
    }
];

export const barChart2Series = {
    isLoaded: true,
    headers: [{
        type: 'attrLabel',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Year (Closed)'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: 'aaa <b># of Open Opps.</b>',
        format: '<button>#,##0.00</button>'
    }, {
        type: 'metric',
        id: 'afdV48ABh8CN',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/2825',
        title: '# of Opportunities',
        format: '#,##0'
    }],
    rawData: [
        [
            {
                id: '2010',
                name: '2010'
            },
            '30',
            '1324'
        ],
        [
            {
                id: '2011',
                name: '2011'
            },
            '74',
            '2703'
        ],
        [
            {
                id: '2012',
                name: '2012'
            },
            '735',
            '1895'
        ],
        [
            {
                id: '2013',
                name: '2013'
            },
            '74',
            '74'
        ],
        [
            {
                id: '2014',
                name: '2014 <a href="www.google.com">sdfs</a>'
            },
            '4',
            '4'
        ],
        [
            {
                id: '2016',
                name: '2016'
            },
            '1',
            '1'
        ],
        [
            {
                id: '2017',
                name: '2017'
            },
            '1',
            '1'
        ]
    ],
    isLoading: false
};

export const barChart2SeriesDrillableItems = [
    {
        uri: barChart2Series.headers[1].uri,
        identifier: barChart2Series.headers[1].id
    }
];

export const stackedBar = {
    isLoaded: true,
    headers: [{
        type: 'attrLabel',
        id: 'label.owner.id.name',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028',
        title: `Sales Rep (element 1, element 2, element 3, element 4,
            element 5, element 6, element 7, element 8, element 9, element 10, element 11)`
    }, {
        type: 'attrLabel',
        id: 'label.stage.name.stagename',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805',
        title: 'Stage Name'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: '# of Open Opps.',
        format: '#,##0'
    }],
    rawData: [
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '13'
        ],
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '11'
        ],
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '3'
        ],
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '2'
        ],
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '2'
        ],
        [
            {
                id: '1224',
                name: 'Adam Bradley'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '2'
        ],
        [
            {
                id: '1227',
                name: 'Alejandro Vabiano'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '8'
        ],
        [
            {
                id: '1227',
                name: 'Alejandro Vabiano'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '11'
        ],
        [
            {
                id: '1227',
                name: 'Alejandro Vabiano'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '7'
        ],
        [
            {
                id: '1227',
                name: 'Alejandro Vabiano'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1227',
                name: 'Alejandro Vabiano'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '2'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '8'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '11'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '9'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '3'
        ],
        [
            {
                id: '1228',
                name: 'Alexsandr Fyodr'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '3'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '11'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '9'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '4'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '3'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '1'
        ],
        [
            {
                id: '1229',
                name: 'Cory Owens'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '2'
        ],
        [
            {
                id: '1230',
                name: 'Dale Perdadtin'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '5'
        ],
        [
            {
                id: '1230',
                name: 'Dale Perdadtin'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '12'
        ],
        [
            {
                id: '1230',
                name: 'Dale Perdadtin'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '6'
        ],
        [
            {
                id: '1230',
                name: 'Dale Perdadtin'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '2'
        ],
        [
            {
                id: '1230',
                name: 'Dale Perdadtin'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '5'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '6'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '11'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '10'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '3'
        ],
        [
            {
                id: '1231',
                name: 'Dave Bostadt'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '4'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '13'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '5'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '7'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '1'
        ],
        [
            {
                id: '1232',
                name: 'Ellen Jones'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '2'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '9'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '7'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '5'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '2'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '4'
        ],
        [
            {
                id: '1233',
                name: 'Huey Jonas'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '4'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '5'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '8'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '9'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '2'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '2'
        ],
        [
            {
                id: '1235',
                name: 'Jessica Traven'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '6'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '7'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '9'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '5'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '1'
        ],
        [
            {
                id: '1236',
                name: 'John Jovi'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '3'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '11'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '11'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '7'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '2'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '6'
        ],
        [
            {
                id: '1238',
                name: 'Jon Jons'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '5'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '7'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '8'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '9'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '1'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '2'
        ],
        [
            {
                id: '1239',
                name: 'Lea Forbes'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '3'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '966643',
                name: 'Interest'
            },
            '8'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '966644',
                name: 'Discovery'
            },
            '5'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '1251',
                name: 'Short List'
            },
            '9'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '966645',
                name: 'Risk Assessment'
            },
            '3'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '966646',
                name: 'Conviction'
            },
            '1'
        ],
        [
            {
                id: '1240',
                name: 'Monique Babonas'
            },
            {
                id: '966647',
                name: 'Negotiation'
            },
            '4'
        ]
    ],
    isLoading: false
};

export const stackedBarDrillableItems = [
    {
        uri: stackedBar.headers[2].uri,
        identifier: stackedBar.headers[2].id
    }, {
        uri: stackedBar.headers[0].uri,
        identifier: stackedBar.headers[0].id
    }
];

export const afm = {
    measures: [{
        definition: {
            baseObject: { id: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465' }
        },
        id: 'aaYh6Voua2yj'
    }, {
        definition: {
            baseObject: { id: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13468' }
        },
        id: 'aaYh6Vouasd2yj'
    }, {
        definition: {
            baseObject: { id: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324' }
        },
        id: 'closed.aag81lMifn6q'
    }]
};

export const lgbtPalette = [
    '#FF69B4',
    '#d40606',
    '#ee9c00',
    '#e3ff00',
    '#06bf00',
    '#001a98'
];
