package operations

import (
	"neobackstop/internals"
	"time"

	"github.com/playwright-community/playwright-go"
)

func postInteractionWait(page playwright.Page, piw *internals.SelectorOrDelay) *string {
	if piw != nil {
		if piw.Selector != nil {
			// selector, wait for it
			selector := *piw.Selector

			_, err := page.WaitForSelector(selector, playwright.PageWaitForSelectorOptions{
				State: playwright.WaitForSelectorStateAttached,
				// use default 30s timeout
			})
			if err != nil {
				e := "PostInteractionWait " + selector + " didn't appear"
				return &e
			}
		}
		if piw.Delay != nil {
			// delay, wait
			time.Sleep(*piw.Delay)
		}
	}

	return nil
}
