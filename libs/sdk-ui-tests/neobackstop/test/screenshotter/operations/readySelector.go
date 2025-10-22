package operations

import (
	"github.com/playwright-community/playwright-go"
)

func ReadySelector(page playwright.Page, value *string) *string {
	if value != nil {
		rs := *value
		// there is a ReadySelector, wait for it
		_, err := page.WaitForSelector(rs, playwright.PageWaitForSelectorOptions{
			State:   playwright.WaitForSelectorStateAttached,
			Timeout: playwright.Float(30000), // todo: add timeout to config
		})
		if err != nil {
			e := "ReadySelector " + rs + " didn't appear"
			return &e
		}
	}

	return nil
}
