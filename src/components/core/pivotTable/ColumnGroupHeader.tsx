// (C) 2007-2018 GoodData Corporation
import * as React from 'react';

import { IHeaderGroupParams } from 'ag-grid';
import { IHeaderReactComp } from 'ag-grid-react/lib/interfaces';

import HeaderCell, { ALIGN_LEFT } from './HeaderCell';

export interface IParams extends IHeaderGroupParams {
    enableMenu: boolean;
}

export default class ColumnGroupHeader
  extends React.Component<IParams>
  implements IHeaderReactComp {

  public onMenuClick = () => {
      // tslint:disable-next-line no-console
      console.log('menu clicked');
  }

  public render() {
      const { enableMenu } = this.props;
      const columnGroupDef = this.props.columnGroup.getColGroupDef();
      const parent = this.props.columnGroup.getParent();
      // do not show menu for the first group header and empty headers above row attribute column headers
      const showMenu = enableMenu && !!parent && !!columnGroupDef.headerName;

      return (
          <HeaderCell
              displayText={this.props.displayName}
              enableMenu={showMenu}
              enableSorting={false}
              menuPosition={ALIGN_LEFT}
              textAlign={ALIGN_LEFT}
              onMenuClick={this.onMenuClick}
              className="s-pivot-table-column-group-header"
          />
      );
  }
}
