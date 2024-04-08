// (C) 2020-2024 GoodData Corporation
import { IPivotTableConfig } from "@gooddata/sdk-ui-pivot";

/*
                                 __    _
                            _wr""        "-q__
                         _dP                 9m_
                       _#P                     9#_
                      d#@                       9#m
                     d##                         ###
                    J###                         ###L
                    {###K                       J###K
                    ]####K      ___aaa___      J####F
                __gmM######_  w#P""   ""9#m  _d#####Mmw__
             _g##############mZ_         __g##############m_
           _d####M@PPPP@@M#######Mmp gm#########@@PPP9@M####m_
          a###""          ,Z"#####@" '######"\g          ""M##m
         J#@"             0L  "*##     ##@"  J#              *#K
         #"               `#    "_gmwgm_~    dF               `#_
        7F                 "#_   ]#####F   _dK                 JE
        ]                    *m__ ##### __g@"                   F
                               "PJ#####LP"
         `                       0######_                      '
                               _0########_
             .               _d#####^#####m__              ,
              "*w_________am#####P"   ~9#####mw_________w*"
                  ""9@#####@M""           ""P@#####@M""

    Adding more code below the line means flaws in the config vs insight properties design.
 */

/**
 * Creates properties for pivot table. This exists because properties store columnWidths directly and
 * not under columnSizing..
 *
 * @param tableConfig - may be undefined
 */
export function pivotConfigToVisProperties(tableConfig: IPivotTableConfig = {}): any {
    /*
     * Indeed, the properties content is stored in 'properties' entry in insight AND the content itself
     * is wrapped in another object under 'properties' entry.
     *
     * For more see: getSupportedProperties in propertiesHelper.ts or the code that creates insight
     */
    return {
        controls: {
            measureGroupDimension: tableConfig.measureGroupDimension,
            columnHeadersPosition: tableConfig.columnHeadersPosition,
            ...(tableConfig?.columnSizing?.columnWidths
                ? { columnWidths: tableConfig.columnSizing.columnWidths }
                : {}),
        },
    };
}
