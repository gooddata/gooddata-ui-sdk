package operations

import (
	"neobackstop/internals"
	"time"

	"github.com/playwright-community/playwright-go"
)

func ClickSelectors(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.ClickSelectors != nil {
		for _, cs := range scenario.ClickSelectors {
			if cs.WaitBefore != nil {
				// wait before
				time.Sleep(*cs.WaitBefore)
			}

			_, err := page.WaitForSelector(cs.Selector, playwright.PageWaitForSelectorOptions{
				State:   playwright.WaitForSelectorStateVisible,
				Timeout: playwright.Float(10000), // default 10s
			})
			if err != nil {
				e := "ClickSelector " + cs.Selector + " didn't appear"
				return &e
			}

			err = page.Click(cs.Selector)
			if err != nil {
				e := "ClickSelector " + cs.Selector + " couldn't be clicked"
				return &e
			}

			sErr := postInteractionWait(page, scenario.PostInteractionWait)
			if sErr != nil {
				return sErr
			}

			if cs.WaitAfter != nil {
				// wait after
				time.Sleep(*cs.WaitAfter)
			}
		}
	}

	return nil
}
