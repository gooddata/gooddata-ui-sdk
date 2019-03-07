// (C) 2007-2019 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingLoginForm } from './utils/helpers';

fixture('Attribute filter components')
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/attribute-filter-components`));

test('Dropdown filter opens, clears, selects all and applies', async (t) => {
    const dropdownButton = Selector('.button.s-employee_name');
    const clearButton = Selector('.s-clear');
    const selectAllButton = Selector('.s-select_all');
    const applyButton = Selector('.s-apply');
    const attributeFiltersOverlay = Selector('.gd-attribute-filter-overlay');
    const attributeFilterItems = attributeFiltersOverlay.find('.s-attribute-filter-list-item');

    await t
        .click(dropdownButton)
        .expect(dropdownButton.hasClass('is-dropdown-open')).ok()
        .expect(dropdownButton.hasClass('is-active')).ok()
        .expect(attributeFilterItems.nth(0).child('input[type=checkbox]').checked).ok()
        .click(clearButton)
        .expect(attributeFilterItems.nth(0).child('input[type=checkbox]').checked).notOk()
        .click(selectAllButton)
        .expect(attributeFilterItems.nth(0).child('input[type=checkbox]').checked).ok()
        .click(applyButton)
        .expect(dropdownButton.hasClass('is-dropdown-open')).notOk()
        .expect(dropdownButton.hasClass('is-active')).notOk();
});

test('Custom filter shows more', async (t) => {
    const attributeFilterItem = Selector('.s-attribute-filter-list-item');
    const showMoreButton = Selector('.s-show-more-filters-button');

    await t
        .expect(attributeFilterItem.count).eql(20) // NOTE: this test failed sometimes when --assertion-timout was 5 s
        .click(showMoreButton)
        .expect(attributeFilterItem.count).eql(40);
});
