// (C) 2020 GoodData Corporation

import { IBucket, IExecutionDefinition } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

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


   If you find yourself adding code below this line, then it means your component is not designed
   correctly.
 */

export function geoExecutionToInsightBuckets(execution: IExecutionDefinition | undefined): IBucket[] {
    if (!execution) {
        return [];
    }

    return execution.buckets.filter((bucket) => bucket.localIdentifier !== BucketNames.TOOLTIP_TEXT);
}
