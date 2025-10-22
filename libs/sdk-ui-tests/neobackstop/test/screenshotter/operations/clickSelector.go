package operations

import (
	"neobackstop/internals"

	"github.com/playwright-community/playwright-go"
)

func ClickSelector(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.ClickSelector != nil {
		cs := *scenario.ClickSelector

		_, err := page.WaitForSelector(cs, playwright.PageWaitForSelectorOptions{
			State:   playwright.WaitForSelectorStateVisible,
			Timeout: playwright.Float(10000), // default 10s
		})
		if err != nil {
			e := "ClickSelector " + cs + " didn't appear"
			return &e
		}

		err = page.Click(cs)
		if err != nil {
			e := "ClickSelector " + cs + " couldn't be clicked"
			return &e
		}

		return postInteractionWait(page, scenario.PostInteractionWait)
	}

	return nil
}
