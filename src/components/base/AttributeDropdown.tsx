import * as React from 'react';
import InvertableList from '@gooddata/goodstrap/lib/List/InvertableList';
import Button from '@gooddata/goodstrap/lib/Button/Button';
import Dropdown, { DropdownButton } from '@gooddata/goodstrap/lib/Dropdown/Dropdown';
import { string as stringUtils } from '@gooddata/js-utils';
import DataSource from '@gooddata/goodstrap/lib/DataSource/DataSource';
import { injectIntl, intlShape } from 'react-intl';
import * as sdk from 'gooddata';
import * as classNames from 'classnames';
import last = require('lodash/last');
import pick = require('lodash/pick');
import range = require('lodash/range');
import isEqual = require('lodash/isEqual');

import { AttributeFilterItem } from './AttributeFilterItem';
import { IAttributeDisplayForm, IAttributeElement } from './model';

const { PropTypes } = React;

const ITEM_HEIGHT = 28;
const LIST_WIDTH = 208;
const MAX_SELECTION_SIZE = 500;

export const VISIBLE_ITEMS_COUNT = 10;
export const LIMIT = 50;
const INITIAL_OFFSET = 0;

const getDefaultListLoading = (_listError, { intl }) => {
    const text = intl.formatMessage({ id: 'gs.list.loading' });
    return <div><span className="s-attribute-filter-list-loading"></span> {text}</div>;
};

const getDefaultListError = (_listError, { intl }) => {
    const text = intl.formatMessage({ id: 'gs.list.error' });
    return <div className="gd-message error">{text}</div>;
};

const getDefaultListNoResults = (_listError, { intl }) => {
    const text = intl.formatMessage({ id: 'gs.list.noItemsFound' });
    return <div>{text}</div>;
};

export interface IAttributeDropdownProps {
    attributeDisplayForm: IAttributeDisplayForm;
    projectId: string;
    onApply: Function;
    fullscreenOnMobile?: boolean;
    isUsingIdentifier: boolean;
    intl: {
        formatMessage: Function
    };
    metadata?: {
        getValidElements: (projectId, objectId, options) => Promise<{
            data: {
                offset: number;
                limit: number;
                items: {
                    uri: string;
                    title: string;
                }[];
                totalCount: string;
            }
        }>
    };
    getListItem?: Function;
    getListLoading?: Function;
    getListError?: Function;
    getListNoResults?: Function;
}

export interface IAttributeDropdownState {
    items: {
        title: string,
        uri: string,
        selected?: boolean
    }[];
    totalCount?: number;
    selection: IAttributeElement[];
    isListReady: boolean;
    isListInitialising: boolean;
    listError?: any;
    isInverted: boolean;
    filterError?: any;
    searchString?: string;
}

export function getObjectIdFromUri(uri) {
    return last(uri.split('/'));
}

export function getProjectIdFromUri(uri) {
    return uri.split('/')[3];
}

export function loadAttributeElements(metadata, uri, searchString, offset = INITIAL_OFFSET, limit = LIMIT) {
    const encodedSearchString = encodeURIComponent(searchString);
    const projectId = getProjectIdFromUri(uri);
    const objectId = getObjectIdFromUri(uri);
    const options = {
        limit,
        offset,
        filter: encodedSearchString
    };

    return metadata.getValidElements(projectId, objectId, options)
        .then((res) => {
            const { items, paging: { total } } = res.validElements;
            return {
                data: {
                    offset,
                    limit,
                    items: items.map(item => pick(item.element, 'uri', 'title')),
                    totalCount: parseInt(total, 10)
                }
            };
        });
}

function getElementId(element: IAttributeElement) {
    return element.uri.split('=')[1];
}

export function createAfmFilter(id: string, selection: IAttributeElement[], isInverted: boolean) {
    return {
        id,
        type: 'attribute',
        [isInverted ? 'notIn' : 'in']: selection.map(getElementId)
    };
}

export class AttributeDropdownWrapped extends React.PureComponent<IAttributeDropdownProps,IAttributeDropdownState> {
    private dataSource;
    private dropdownRef;
    private MediaQuery;
    
    static propTypes = {
        attributeDisplayForm: PropTypes.object.isRequired,
        projectId: PropTypes.string.isRequired,
        isUsingIdentifier: PropTypes.bool,
        intl: intlShape.isRequired,
        
        onApply: PropTypes.func.isRequired,
        fullscreenOnMobile: PropTypes.bool,
        
        getListItem: PropTypes.func,
        getListLoading: PropTypes.func,
        getListError: PropTypes.func,
        getListNoResults: PropTypes.func,
        
        metadata: PropTypes.shape({
            getValidElements: PropTypes.func.isRequired
        })
    };

    static defaultProps = {
        fullscreenOnMobile: false,
        isUsingIdentifier: false,

        metadata: sdk.md,
        getListItem: () => (<AttributeFilterItem />),
        getListLoading: getDefaultListLoading,
        getListError: getDefaultListError,
        getListNoResults: getDefaultListNoResults
    };

    constructor(props) {
        super(props);

        this.state = {
            isListInitialising: false,
            isListReady: false,
            listError: null,
            items: [],
            selection: [],
            isInverted: true,
            searchString: ''
        };

        this.createMediaQuery(props.fullscreenOnMobile);

        this.onDropdownToggle = this.onDropdownToggle.bind(this);
        this.onApply = this.onApply.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps.attributeDisplayForm, this.props.attributeDisplayForm)) {
            this.setupDataSource(nextProps.attributeDisplayForm.uri);
        }
        if (this.props.fullscreenOnMobile !== nextProps.fullscreenOnMobile) {
            this.createMediaQuery(nextProps.fullscreenOnMobile);
        }
    }

    createMediaQuery(fullscreenOnMobile) {
        this.MediaQuery = fullscreenOnMobile ? undefined : ({ children }) => children(false);
    }

    onApply() {
        const { selection, isInverted } = this.state;
        const { attributeDisplayForm, isUsingIdentifier } = this.props;
        const id: string = isUsingIdentifier ? attributeDisplayForm.meta.identifier : attributeDisplayForm.meta.uri;
        
        this.props.onApply(createAfmFilter(id, selection, isInverted));
        this.dropdownRef.closeDropdown();
    }

    onClose() {
        this.dropdownRef.closeDropdown();
    }

    getAttributeElements(uri, query) {
        const {
            paging: {
                offset = 0,
                limit = LIMIT
            } = {}
        } = query;
        const { metadata } = this.props;
        const { searchString } = this.state;
        return loadAttributeElements(metadata, uri, searchString, offset, limit).catch((error) => {
            this.setState({
                isListInitialising: false,
                isListReady: false,
                listError: error
            });
            throw error;
        });
    }

    setupDataSource(uri) {
        const request = this.getAttributeElements.bind(this, uri);

        this.setState({
            isListInitialising: true,
            listError: null
        });

        this.dataSource = new DataSource(request, request, {
            pageSize: LIMIT
        });

        this.dataSource.onChange((result) => {
            this.setState({
                totalCount: result.data.totalCount,
                isListReady: true,
                listError: null,
                items: result.data.items.map(i => i || { empty: true }),
                isListInitialising: true
            });
        });

        this.dataSource.getData({});
    }

    onSelect = (selection, isInverted) => {
        this.setState({
            selection,
            isInverted
        });
    }

    onSearch = (searchString) => {
        this.setState({ searchString });
    }

    onRangeChange = (_, from, to) => {
        range(from, to).forEach(this.dataSource.getRowAt);
    }

    onDropdownToggle(isDropdownOpen) {
        const { isListReady, isListInitialising } = this.state;
        const { attributeDisplayForm } = this.props;
        if (isDropdownOpen && !isListReady && !isListInitialising) {
            this.setupDataSource(attributeDisplayForm.meta.uri);
        }
    }

    renderOverlayWrap(overlayContent, applyDisabled = false) {
        return (
            <div className="gd-attribute-filter-overlay">
                {overlayContent}
                {this.renderButtons(applyDisabled)}
            </div>
        );
    }

    renderList() {
        const { isListReady, items, selection, listError, totalCount } = this.state;
        const { getListError, getListLoading, getListNoResults } = this.props;

        if (listError) {
            return this.renderOverlayWrap(getListError(listError, this.props, this.state), true);
        }
        
        if (!isListReady) {
            return this.renderOverlayWrap(getListLoading(listError, this.props, this.state), true);
        }
        
        if (!items.length) {
            return this.renderOverlayWrap(getListNoResults(listError, this.props, this.state), true);
        }

        return this.renderOverlayWrap(
            <InvertableList
                items={items}
                itemsCount={totalCount}
                filteredItemsCount={totalCount}
                selection={selection}
                isInverted={this.state.isInverted}
                showSearchField={false}
                rowItem={<AttributeFilterItem />}
                maxSelectionSize={MAX_SELECTION_SIZE}
                width={LIST_WIDTH}
                itemHeight={ITEM_HEIGHT}
                height={ITEM_HEIGHT * VISIBLE_ITEMS_COUNT}
                onRangeChange={this.onRangeChange}
                onSearch={this.onSearch}
                onSelect={this.onSelect}
            />
        );
    }

    renderButtons(applyDisabled) {
        const { intl } = this.props;
        const cancelText = intl.formatMessage({ id: 'gs.list.cancel' });
        const applyText = intl.formatMessage({ id: 'gs.list.apply' });
        return (
            <div className="gd-attribute-filter-actions">
                <Button
                    className="button-secondary button-small cancel-button"
                    onClick={this.onClose}
                    value={cancelText}
                    text={cancelText}
                />
                <Button
                    disabled={applyDisabled}
                    className="button-action button-small s-apply"
                    onClick={this.onApply}
                    value={applyText}
                    text={applyText}
                />
            </div>
        );
    }

    render() {
        const { attributeDisplayForm } = this.props;
        const classes = classNames(
            'gd-attribute-filter',
            attributeDisplayForm ? `gd-id-${stringUtils.simplifyText(attributeDisplayForm.meta.title)}` : ''
        );

        return (
            <Dropdown
                button={<DropdownButton value={attributeDisplayForm.meta.title} />}
                ref={ref => (this.dropdownRef = ref)}
                body={this.renderList()}
                className={classes}
                onOpenStateChanged={this.onDropdownToggle}
                MediaQuery={this.MediaQuery}
            />
        );
    }
}

export const AttributeDropdown = injectIntl(AttributeDropdownWrapped);
