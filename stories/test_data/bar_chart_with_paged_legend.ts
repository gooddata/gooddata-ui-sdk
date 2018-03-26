// (C) 2007-2018 GoodData Corporation
const config: any = {
    type: 'column',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/9211',
                    title: '_Close [BOP]',
                    measureFilters: [],
                    showInPercent: false,
                    showPoP: false
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'attribute',
                    collection: 'view',
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970'
                }
            }, {
                category: {
                    type: 'attribute',
                    collection: 'stack',
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970'
                }
            }
        ],
        filters: [
            {
                listAttributeFilter: {
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970',
                    default: {
                        negativeSelection: true,
                        attributeElements: []
                    }
                }
            }
        ]
    }
};

const data = {
    isLoaded: true,
    headers: [
        {
            type: 'attrLabel',
            id: 'label.account.id.name',
            uri: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970',
            title: 'Account'
        }, {
            type: 'attrLabel',
            id: 'label.account.id.name',
            uri: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970',
            title: 'Account'
        }, {
            type: 'metric',
            id: 'e933f8989a54e8a1d842a30b15c9c074',
            title: '_Close [BOP]',
            format: '#,##0.00'
        }
    ],
    rawData: [
        [
            {
                id: '958105',
                name: '7-Eleven'
            },
            {
                id: '958105',
                name: '7-Eleven'
            },
            '41013'
        ],
        [
            {
                id: '961294',
                name: 'ASK Staffing'
            },
            {
                id: '961294',
                name: 'ASK Staffing'
            },
            '40786'
        ],
        [
            {
                id: '955387',
                name: 'ASI System Integration'
            },
            {
                id: '955387',
                name: 'ASI System Integration'
            },
            '40727'
        ],
        [
            {
                id: '955219',
                name: 'Aerial Services'
            },
            {
                id: '955219',
                name: 'Aerial Services'
            },
            '40689'
        ],
        [
            {
                id: '961370',
                name: 'Batteries Plus'
            },
            {
                id: '961370',
                name: 'Batteries Plus'
            },
            '40661'
        ],
        [
            {
                id: '955451',
                name: 'Bankers Healthcare Group'
            },
            {
                id: '955451',
                name: 'Bankers Healthcare Group'
            },
            '40659'
        ],
        [
            {
                id: '958217',
                name: 'Algonquin Advisors'
            },
            {
                id: '958217',
                name: 'Algonquin Advisors'
            },
            '40655'
        ],
        [
            {
                id: '961104',
                name: 'AccountNow'
            },
            {
                id: '961104',
                name: 'AccountNow'
            },
            '40652'
        ],
        [
            {
                id: '958077',
                name: '101 Financial'
            },
            {
                id: '958077',
                name: '101 Financial'
            },
            '40646'
        ],
        [
            {
                id: '964782',
                name: 'Aasent Mortgage Corporation'
            },
            {
                id: '964782',
                name: 'Aasent Mortgage Corporation'
            },
            '40633'
        ],
        [
            {
                id: '958539',
                name: 'Camp Bow Wow'
            },
            {
                id: '958539',
                name: 'Camp Bow Wow'
            },
            '40633'
        ],
        [
            {
                id: '965530',
                name: 'A.R.M. Solutions'
            },
            {
                id: '965530',
                name: 'A.R.M. Solutions'
            },
            '40630'
        ],
        [
            {
                id: '964777',
                name: 'A10 Clinical Solutions'
            },
            {
                id: '964777',
                name: 'A10 Clinical Solutions'
            },
            '40626'
        ],
        [
            {
                id: '955431',
                name: 'BACtrack Breathalyzers'
            },
            {
                id: '955431',
                name: 'BACtrack Breathalyzers'
            },
            '40625'
        ],
        [
            {
                id: '955225',
                name: 'agencyQ'
            },
            {
                id: '955225',
                name: 'agencyQ'
            },
            '40622'
        ],
        [
            {
                id: '958369',
                name: 'Avalon Global Solutions'
            },
            {
                id: '958369',
                name: 'Avalon Global Solutions'
            },
            '40580'
        ],
        [
            {
                id: '955609',
                name: 'Canyon Manufacturing Services'
            },
            {
                id: '955609',
                name: 'Canyon Manufacturing Services'
            },
            '40570'
        ],
        [
            {
                id: '958135',
                name: 'Accelerated Financial Solutions'
            },
            {
                id: '958135',
                name: 'Accelerated Financial Solutions'
            },
            '40554'
        ],
        [
            {
                id: '958471',
                name: 'Booksfree.com'
            },
            {
                id: '958471',
                name: 'Booksfree.com'
            },
            '40542'
        ],
        [
            {
                id: '958223',
                name: 'Allconnect'
            },
            {
                id: '958223',
                name: 'Allconnect'
            },
            '40541'
        ],
        [
            {
                id: '955223',
                name: 'Aerospace & Commercial Technologies'
            },
            {
                id: '955223',
                name: 'Aerospace & Commercial Technologies'
            },
            '40535'
        ],
        [
            {
                id: '955365',
                name: 'Arkadin'
            },
            {
                id: '955365',
                name: 'Arkadin'
            },
            '40535'
        ],
        [
            {
                id: '961300',
                name: 'Astor & Black Custom Clothiers'
            },
            {
                id: '961300',
                name: 'Astor & Black Custom Clothiers'
            },
            '40534'
        ],
        [
            {
                id: '961150',
                name: 'Aerodyn Engineering'
            },
            {
                id: '961150',
                name: 'Aerodyn Engineering'
            },
            '40531'
        ],
        [
            {
                id: '958119',
                name: 'AArrow Advertising'
            },
            {
                id: '958119',
                name: 'AArrow Advertising'
            },
            '40526'
        ],
        [
            {
                id: '961060',
                name: '5LINX Enterprises'
            },
            {
                id: '961060',
                name: '5LINX Enterprises'
            },
            '40521'
        ],
        [
            {
                id: '961174',
                name: 'ALaS Consulting'
            },
            {
                id: '961174',
                name: 'ALaS Consulting'
            },
            '40511'
        ],
        [
            {
                id: '958231',
                name: 'Alpha Imaging'
            },
            {
                id: '958231',
                name: 'Alpha Imaging'
            },
            '40511'
        ],
        [
            {
                id: '958287',
                name: 'APCO Worldwide'
            },
            {
                id: '958287',
                name: 'APCO Worldwide'
            },
            '40511'
        ],
        [
            {
                id: '955163',
                name: 'Access Information Management'
            },
            {
                id: '955163',
                name: 'Access Information Management'
            },
            '40507'
        ],
        [
            {
                id: '955209',
                name: 'Advent Global Solutions'
            },
            {
                id: '955209',
                name: 'Advent Global Solutions'
            },
            '40507'
        ],
        [
            {
                id: '958205',
                name: 'AirSplat'
            },
            {
                id: '958205',
                name: 'AirSplat'
            },
            '40507'
        ],
        [
            {
                id: '961216',
                name: 'Amelia\'s'
            },
            {
                id: '961216',
                name: 'Amelia\'s'
            },
            '40507'
        ],
        [
            {
                id: '961170',
                name: 'AJ Riggins'
            },
            {
                id: '961170',
                name: 'AJ Riggins'
            },
            '40506'
        ],
        [
            {
                id: '961472',
                name: 'Bug Doctor'
            },
            {
                id: '961472',
                name: 'Bug Doctor'
            },
            '40506'
        ],
        [
            {
                id: '965610',
                name: 'Behavioral Health Group'
            },
            {
                id: '965610',
                name: 'Behavioral Health Group'
            },
            '40505'
        ],
        [
            {
                id: '958107',
                name: '90octane'
            },
            {
                id: '958107',
                name: '90octane'
            },
            '40501'
        ],
        [
            {
                id: '961084',
                name: 'ABCOMRents.com'
            },
            {
                id: '961084',
                name: 'ABCOMRents.com'
            },
            '40500'
        ],
        [
            {
                id: '961440',
                name: 'Boston Interactive'
            },
            {
                id: '961440',
                name: 'Boston Interactive'
            },
            '40499'
        ],
        [
            {
                id: '958123',
                name: 'ABBTech Staffing Services'
            },
            {
                id: '958123',
                name: 'ABBTech Staffing Services'
            },
            '40498'
        ],
        [
            {
                id: '964109',
                name: 'Ambit Energy'
            },
            {
                id: '964109',
                name: 'Ambit Energy'
            },
            '40498'
        ],
        [
            {
                id: '958333',
                name: 'Ascendent Engineering & Safety Solutions'
            },
            {
                id: '958333',
                name: 'Ascendent Engineering & Safety Solutions'
            },
            '40498'
        ],
        [
            {
                id: '958377',
                name: 'Avisena'
            },
            {
                id: '958377',
                name: 'Avisena'
            },
            '40498'
        ],
        [
            {
                id: '955557',
                name: 'Brightway Insurance'
            },
            {
                id: '955557',
                name: 'Brightway Insurance'
            },
            '40498'
        ],
        [
            {
                id: '958403',
                name: 'Battle Resource Management'
            },
            {
                id: '958403',
                name: 'Battle Resource Management'
            },
            '40496'
        ],
        [
            {
                id: '961048',
                name: '1st Choice Staffing & Consulting'
            },
            {
                id: '961048',
                name: '1st Choice Staffing & Consulting'
            },
            '40480'
        ],
        [
            {
                id: '955143',
                name: 'A White Orchid Wedding'
            },
            {
                id: '955143',
                name: 'A White Orchid Wedding'
            },
            '40479'
        ],
        [
            {
                id: '958089',
                name: '352 Media Group'
            },
            {
                id: '958089',
                name: '352 Media Group'
            },
            '40470'
        ],
        [
            {
                id: '961096',
                name: 'Access Worldwide'
            },
            {
                id: '961096',
                name: 'Access Worldwide'
            },
            '40466'
        ],
        [
            {
                id: '958335',
                name: 'ASE Technology'
            },
            {
                id: '958335',
                name: 'ASE Technology'
            },
            '40465'
        ],
        [
            {
                id: '955531',
                name: 'Body Central'
            },
            {
                id: '955531',
                name: 'Body Central'
            },
            '40464'
        ],
        [
            {
                id: '961046',
                name: '1-888-OhioComp'
            },
            {
                id: '961046',
                name: '1-888-OhioComp'
            },
            '40463'
        ],
        [
            {
                id: '958099',
                name: '4th Source'
            },
            {
                id: '958099',
                name: '4th Source'
            },
            '40462'
        ],
        [
            {
                id: '961062',
                name: '6K Systems'
            },
            {
                id: '961062',
                name: '6K Systems'
            },
            '40455'
        ],
        [
            {
                id: '958477',
                name: 'Bracewell & Giuliani'
            },
            {
                id: '958477',
                name: 'Bracewell & Giuliani'
            },
            '40450'
        ],
        [
            {
                id: '961452',
                name: 'Breaking Ground Contracting'
            },
            {
                id: '961452',
                name: 'Breaking Ground Contracting'
            },
            '40450'
        ],
        [
            {
                id: '961456',
                name: 'BridgePoint Technologies'
            },
            {
                id: '961456',
                name: 'BridgePoint Technologies'
            },
            '40450'
        ],
        [
            {
                id: '955613',
                name: 'Capps Manufacturing'
            },
            {
                id: '955613',
                name: 'Capps Manufacturing'
            },
            '40450'
        ],
        [
            {
                id: '955447',
                name: 'BandCon'
            },
            {
                id: '955447',
                name: 'BandCon'
            },
            '40444'
        ],
        [
            {
                id: '955243',
                name: 'Ali International'
            },
            {
                id: '955243',
                name: 'Ali International'
            },
            '40443'
        ],
        [
            {
                id: '965575',
                name: 'Archimedes Global'
            },
            {
                id: '965575',
                name: 'Archimedes Global'
            },
            '40442'
        ],
        [
            {
                id: '964101',
                name: 'AK Environmental'
            },
            {
                id: '964101',
                name: 'AK Environmental'
            },
            '40437'
        ],
        [
            {
                id: '964834',
                name: 'AXIA Consulting'
            },
            {
                id: '964834',
                name: 'AXIA Consulting'
            },
            '40437'
        ],
        [
            {
                id: '958399',
                name: 'Barhorst Insurance Group'
            },
            {
                id: '958399',
                name: 'Barhorst Insurance Group'
            },
            '40434'
        ],
        [
            {
                id: '961092',
                name: 'Access Insurance Holdings'
            },
            {
                id: '961092',
                name: 'Access Insurance Holdings'
            },
            '40431'
        ],
        [
            {
                id: '955429',
                name: 'BackOffice Associates'
            },
            {
                id: '955429',
                name: 'BackOffice Associates'
            },
            '40426'
        ],
        [
            {
                id: '961054',
                name: '3Degrees'
            },
            {
                id: '961054',
                name: '3Degrees'
            },
            '40420'
        ],
        [
            {
                id: '958103',
                name: '720 Strategies'
            },
            {
                id: '958103',
                name: '720 Strategies'
            },
            '40420'
        ],
        [
            {
                id: '955275',
                name: 'Altour'
            },
            {
                id: '955275',
                name: 'Altour'
            },
            '40420'
        ],
        [
            {
                id: '955371',
                name: 'ArrowStream'
            },
            {
                id: '955371',
                name: 'ArrowStream'
            },
            '40420'
        ],
        [
            {
                id: '958449',
                name: 'Blue C Advertising'
            },
            {
                id: '958449',
                name: 'Blue C Advertising'
            },
            '40420'
        ],
        [
            {
                id: '955515',
                name: 'Blue Cod Technologies'
            },
            {
                id: '955515',
                name: 'Blue Cod Technologies'
            },
            '40420'
        ],
        [
            {
                id: '961410',
                name: 'Blacklist'
            },
            {
                id: '961410',
                name: 'Blacklist'
            },
            '40419'
        ],
        [
            {
                id: '955339',
                name: 'Apptis'
            },
            {
                id: '955339',
                name: 'Apptis'
            },
            '40417'
        ],
        [
            {
                id: '961044',
                name: '1-800 We Answer'
            },
            {
                id: '961044',
                name: '1-800 We Answer'
            },
            '40416'
        ],
        [
            {
                id: '961038',
                name: '1 Source Consulting'
            },
            {
                id: '961038',
                name: '1 Source Consulting'
            },
            '40416'
        ],
        [
            {
                id: '958097',
                name: '49er Communications'
            },
            {
                id: '958097',
                name: '49er Communications'
            },
            '40416'
        ],
        [
            {
                id: '961072',
                name: 'A.B. Data'
            },
            {
                id: '961072',
                name: 'A.B. Data'
            },
            '40416'
        ],
        [
            {
                id: '961086',
                name: 'Able Equipment Rental'
            },
            {
                id: '961086',
                name: 'Able Equipment Rental'
            },
            '40416'
        ],
        [
            {
                id: '958233',
                name: 'Alpha Source'
            },
            {
                id: '958233',
                name: 'Alpha Source'
            },
            '40416'
        ],
        [
            {
                id: '961218',
                name: 'Amensys'
            },
            {
                id: '961218',
                name: 'Amensys'
            },
            '40416'
        ],
        [
            {
                id: '955413',
                name: 'AutoClaims Direct'
            },
            {
                id: '955413',
                name: 'AutoClaims Direct'
            },
            '40416'
        ],
        [
            {
                id: '955491',
                name: 'BeyondTrust'
            },
            {
                id: '955491',
                name: 'BeyondTrust'
            },
            '40416'
        ],
        [
            {
                id: '961438',
                name: 'Booz Allen Hamilton'
            },
            {
                id: '961438',
                name: 'Booz Allen Hamilton'
            },
            '40416'
        ],
        [
            {
                id: '961344',
                name: 'B Resource'
            },
            {
                id: '961344',
                name: 'B Resource'
            },
            '40416'
        ],
        [
            {
                id: '955131',
                name: '(mt) Media Temple'
            },
            {
                id: '955131',
                name: '(mt) Media Temple'
            },
            '40416'
        ],
        [
            {
                id: '955445',
                name: 'Bamco'
            },
            {
                id: '955445',
                name: 'Bamco'
            },
            '40413'
        ],
        [
            {
                id: '958157',
                name: 'adaQuest'
            },
            {
                id: '958157',
                name: 'adaQuest'
            },
            '40412'
        ],
        [
            {
                id: '955299',
                name: 'American Unit'
            },
            {
                id: '955299',
                name: 'American Unit'
            },
            '40411'
        ],
        [
            {
                id: '961238',
                name: 'An Amazing Organization'
            },
            {
                id: '961238',
                name: 'An Amazing Organization'
            },
            '40409'
        ],
        [
            {
                id: '961262',
                name: 'AppRiver'
            },
            {
                id: '961262',
                name: 'AppRiver'
            },
            '40409'
        ],
        [
            {
                id: '958311',
                name: 'Arizon Companies'
            },
            {
                id: '958311',
                name: 'Arizon Companies'
            },
            '40409'
        ],
        [
            {
                id: '961234',
                name: 'Ameri-Kleen'
            },
            {
                id: '961234',
                name: 'Ameri-Kleen'
            },
            '40406'
        ],
        [
            {
                id: '958417',
                name: 'Best Practice Systems'
            },
            {
                id: '958417',
                name: 'Best Practice Systems'
            },
            '40406'
        ],
        [
            {
                id: '955487',
                name: 'Best Rate Referrals'
            },
            {
                id: '955487',
                name: 'Best Rate Referrals'
            },
            '40406'
        ],
        [
            {
                id: '964867',
                name: 'Blurb'
            },
            {
                id: '964867',
                name: 'Blurb'
            },
            '40404'
        ],
        [
            {
                id: '961426',
                name: 'BluWater Consulting'
            },
            {
                id: '961426',
                name: 'BluWater Consulting'
            },
            '40404'
        ],
        [
            {
                id: '955271',
                name: 'Alpha Card Services'
            },
            {
                id: '955271',
                name: 'Alpha Card Services'
            },
            '40402'
        ],
        [
            {
                id: '958325',
                name: 'Arrowhead Advertising'
            },
            {
                id: '958325',
                name: 'Arrowhead Advertising'
            },
            '40401'
        ],
        [
            {
                id: '955297',
                name: 'American Tire Distributors'
            },
            {
                id: '955297',
                name: 'American Tire Distributors'
            },
            '40400'
        ],
        [
            {
                id: '964889',
                name: 'Cantaloupe Systems'
            },
            {
                id: '964889',
                name: 'Cantaloupe Systems'
            },
            '40400'
        ],
        [
            {
                id: '958111',
                name: 'A Squared Group'
            },
            {
                id: '958111',
                name: 'A Squared Group'
            },
            '40399'
        ],
        [
            {
                id: '955263',
                name: 'Alliance Benefit Group of Illinois'
            },
            {
                id: '955263',
                name: 'Alliance Benefit Group of Illinois'
            },
            '40398'
        ],
        [
            {
                id: '961376',
                name: 'Beacon Partners'
            },
            {
                id: '961376',
                name: 'Beacon Partners'
            },
            '40395'
        ],
        [
            {
                id: '961378',
                name: 'BEAR Data Systems'
            },
            {
                id: '961378',
                name: 'BEAR Data Systems'
            },
            '40389'
        ],
        [
            {
                id: '961528',
                name: 'Cape Medical Supply'
            },
            {
                id: '961528',
                name: 'Cape Medical Supply'
            },
            '40389'
        ],
        [
            {
                id: '958189',
                name: 'AEEC'
            },
            {
                id: '958189',
                name: 'AEEC'
            },
            '40388'
        ],
        [
            {
                id: '961158',
                name: 'AgileThought'
            },
            {
                id: '961158',
                name: 'AgileThought'
            },
            '40388'
        ],
        [
            {
                id: '964118',
                name: 'Animax Entertainment'
            },
            {
                id: '964118',
                name: 'Animax Entertainment'
            },
            '40388'
        ],
        [
            {
                id: '961258',
                name: 'Applied Analytics'
            },
            {
                id: '961258',
                name: 'Applied Analytics'
            },
            '40388'
        ],
        [
            {
                id: '958381',
                name: 'Aware Web Solutions'
            },
            {
                id: '958381',
                name: 'Aware Web Solutions'
            },
            '40388'
        ],
        [
            {
                id: '958401',
                name: 'Baseball Rampage'
            },
            {
                id: '958401',
                name: 'Baseball Rampage'
            },
            '40388'
        ],
        [
            {
                id: '964853',
                name: 'BidSync'
            },
            {
                id: '964853',
                name: 'BidSync'
            },
            '40388'
        ],
        [
            {
                id: '955493',
                name: 'BigMachines'
            },
            {
                id: '955493',
                name: 'BigMachines'
            },
            '40388'
        ],
        [
            {
                id: '961396',
                name: 'BIGresearch'
            },
            {
                id: '961396',
                name: 'BIGresearch'
            },
            '40388'
        ],
        [
            {
                id: '958443',
                name: 'Blitz'
            },
            {
                id: '958443',
                name: 'Blitz'
            },
            '40388'
        ],
        [
            {
                id: '955539',
                name: 'BOSH Global Services'
            },
            {
                id: '955539',
                name: 'BOSH Global Services'
            },
            '40388'
        ],
        [
            {
                id: '961460',
                name: 'Brighton Cromwell'
            },
            {
                id: '961460',
                name: 'Brighton Cromwell'
            },
            '40388'
        ],
        [
            {
                id: '958277',
                name: 'Anthem Media Group'
            },
            {
                id: '958277',
                name: 'Anthem Media Group'
            },
            '40387'
        ],
        [
            {
                id: '955567',
                name: 'Brooklyn Brewery'
            },
            {
                id: '955567',
                name: 'Brooklyn Brewery'
            },
            '40386'
        ],
        [
            {
                id: '958281',
                name: 'Anytime Fitness'
            },
            {
                id: '958281',
                name: 'Anytime Fitness'
            },
            '40385'
        ],
        [
            {
                id: '961132',
                name: 'Advanced Logistics'
            },
            {
                id: '961132',
                name: 'Advanced Logistics'
            },
            '40381'
        ],
        [
            {
                id: '955213',
                name: 'Advisors Asset Management'
            },
            {
                id: '955213',
                name: 'Advisors Asset Management'
            },
            '40381'
        ],
        [
            {
                id: '958209',
                name: 'Akraya'
            },
            {
                id: '958209',
                name: 'Akraya'
            },
            '40381'
        ],
        [
            {
                id: '955253',
                name: 'All American Rentals'
            },
            {
                id: '955253',
                name: 'All American Rentals'
            },
            '40381'
        ],
        [
            {
                id: '961182',
                name: 'All American Swim Supply'
            },
            {
                id: '961182',
                name: 'All American Swim Supply'
            },
            '40381'
        ],
        [
            {
                id: '958245',
                name: 'American Broadband'
            },
            {
                id: '958245',
                name: 'American Broadband'
            },
            '40381'
        ],
        [
            {
                id: '961292',
                name: 'ASD'
            },
            {
                id: '961292',
                name: 'ASD'
            },
            '40379'
        ],
        [
            {
                id: '958467',
                name: 'Bojangles\' Restaurants, Inc.'
            },
            {
                id: '958467',
                name: 'Bojangles\' Restaurants, Inc.'
            },
            '40379'
        ],
        [
            {
                id: '958411',
                name: 'Belmont Labs'
            },
            {
                id: '958411',
                name: 'Belmont Labs'
            },
            '40376'
        ],
        [
            {
                id: '955481',
                name: 'Benham Real Estate Group'
            },
            {
                id: '955481',
                name: 'Benham Real Estate Group'
            },
            '40376'
        ],
        [
            {
                id: '958193',
                name: 'Aeneas Internet and Telephone'
            },
            {
                id: '958193',
                name: 'Aeneas Internet and Telephone'
            },
            '40374'
        ],
        [
            {
                id: '955389',
                name: 'Aspen Exteriors'
            },
            {
                id: '955389',
                name: 'Aspen Exteriors'
            },
            '40374'
        ],
        [
            {
                id: '958297',
                name: 'Applied Data'
            },
            {
                id: '958297',
                name: 'Applied Data'
            },
            '40373'
        ],
        [
            {
                id: '955355',
                name: 'Arent Fox'
            },
            {
                id: '955355',
                name: 'Arent Fox'
            },
            '40373'
        ],
        [
            {
                id: '955507',
                name: 'Bizzuka'
            },
            {
                id: '955507',
                name: 'Bizzuka'
            },
            '40373'
        ],
        [
            {
                id: '965623',
                name: 'BrightStar Care'
            },
            {
                id: '965623',
                name: 'BrightStar Care'
            },
            '40373'
        ],
        [
            {
                id: '961348',
                name: 'Bailey Kennedy'
            },
            {
                id: '961348',
                name: 'Bailey Kennedy'
            },
            '40372'
        ],
        [
            {
                id: '961402',
                name: 'Biosearch Technologies'
            },
            {
                id: '961402',
                name: 'Biosearch Technologies'
            },
            '40372'
        ],
        [
            {
                id: '955147',
                name: 'A-1 Textiles'
            },
            {
                id: '955147',
                name: 'A-1 Textiles'
            },
            '40371'
        ],
        [
            {
                id: '961100',
                name: 'Accordent'
            },
            {
                id: '961100',
                name: 'Accordent'
            },
            '40368'
        ],
        [
            {
                id: '955341',
                name: 'Aptera Software'
            },
            {
                id: '955341',
                name: 'Aptera Software'
            },
            '40361'
        ],
        [
            {
                id: '958305',
                name: 'Aquifer Solutions'
            },
            {
                id: '958305',
                name: 'Aquifer Solutions'
            },
            '40361'
        ],
        [
            {
                id: '958349',
                name: 'A-T Solutions'
            },
            {
                id: '958349',
                name: 'A-T Solutions'
            },
            '40361'
        ],
        [
            {
                id: '958439',
                name: 'Blaser\'s USA'
            },
            {
                id: '958439',
                name: 'Blaser\'s USA'
            },
            '40361'
        ],
        [
            {
                id: '955351',
                name: 'ArcaMax Publishing'
            },
            {
                id: '955351',
                name: 'ArcaMax Publishing'
            },
            '40360'
        ],
        [
            {
                id: '964821',
                name: 'Archway Technology Partners'
            },
            {
                id: '964821',
                name: 'Archway Technology Partners'
            },
            '40360'
        ],
        [
            {
                id: '958341',
                name: 'Aspen Transportation'
            },
            {
                id: '958341',
                name: 'Aspen Transportation'
            },
            '40360'
        ],
        [
            {
                id: '958383',
                name: 'AWSI'
            },
            {
                id: '958383',
                name: 'AWSI'
            },
            '40360'
        ],
        [
            {
                id: '955427',
                name: 'B2B CFO'
            },
            {
                id: '955427',
                name: 'B2B CFO'
            },
            '40360'
        ],
        [
            {
                id: '955565',
                name: 'Bronto Software'
            },
            {
                id: '955565',
                name: 'Bronto Software'
            },
            '40360'
        ],
        [
            {
                id: '955155',
                name: 'Aaron\'s Sales & Lease Ownership'
            },
            {
                id: '955155',
                name: 'Aaron\'s Sales & Lease Ownership'
            },
            '40359'
        ],
        [
            {
                id: '961168',
                name: 'AIRSIS'
            },
            {
                id: '961168',
                name: 'AIRSIS'
            },
            '40359'
        ],
        [
            {
                id: '961260',
                name: 'Applied Digital Solutions'
            },
            {
                id: '961260',
                name: 'Applied Digital Solutions'
            },
            '40356'
        ],
        [
            {
                id: '955293',
                name: 'American Technologies'
            },
            {
                id: '955293',
                name: 'American Technologies'
            },
            '40353'
        ],
        [
            {
                id: '964122',
                name: 'APEXteriors'
            },
            {
                id: '964122',
                name: 'APEXteriors'
            },
            '40353'
        ],
        [
            {
                id: '955333',
                name: 'Apparatus'
            },
            {
                id: '955333',
                name: 'Apparatus'
            },
            '40353'
        ],
        [
            {
                id: '964130',
                name: 'Array Information Technology'
            },
            {
                id: '964130',
                name: 'Array Information Technology'
            },
            '40353'
        ],
        [
            {
                id: '958137',
                name: 'Access America Transport'
            },
            {
                id: '958137',
                name: 'Access America Transport'
            },
            '40351'
        ],
        [
            {
                id: '961164',
                name: 'Aircraft Cabin Systems'
            },
            {
                id: '961164',
                name: 'Aircraft Cabin Systems'
            },
            '40351'
        ],
        [
            {
                id: '958329',
                name: 'Artemis Laser and Vein Center'
            },
            {
                id: '958329',
                name: 'Artemis Laser and Vein Center'
            },
            '40351'
        ],
        [
            {
                id: '961148',
                name: 'Advisors Mortgage Group'
            },
            {
                id: '961148',
                name: 'Advisors Mortgage Group'
            },
            '40350'
        ],
        [
            {
                id: '955159',
                name: 'Abstract Displays'
            },
            {
                id: '955159',
                name: 'Abstract Displays'
            },
            '40346'
        ],
        [
            {
                id: '961284',
                name: 'Arona'
            },
            {
                id: '961284',
                name: 'Arona'
            },
            '40345'
        ],
        [
            {
                id: '958419',
                name: 'Best Upon Request'
            },
            {
                id: '958419',
                name: 'Best Upon Request'
            },
            '40345'
        ],
        [
            {
                id: '958283',
                name: 'AnytimeCostumes.com'
            },
            {
                id: '958283',
                name: 'AnytimeCostumes.com'
            },
            '40342'
        ],
        [
            {
                id: '955193',
                name: 'Adperio'
            },
            {
                id: '955193',
                name: 'Adperio'
            },
            '40341'
        ],
        [
            {
                id: '958495',
                name: 'Brilliant Environmental Services'
            },
            {
                id: '958495',
                name: 'Brilliant Environmental Services'
            },
            '40339'
        ],
        [
            {
                id: '964779',
                name: 'A10 Networks'
            },
            {
                id: '964779',
                name: 'A10 Networks'
            },
            '40334'
        ],
        [
            {
                id: '961316',
                name: 'Austin GeoModeling'
            },
            {
                id: '961316',
                name: 'Austin GeoModeling'
            },
            '40331'
        ]
    ],
    warnings: [] as any,
    isEmpty: false,
    isLoading: false
};

export default {
    config,
    data
};
