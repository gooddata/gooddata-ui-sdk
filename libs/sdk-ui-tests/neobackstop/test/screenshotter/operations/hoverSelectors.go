package operations

import (
	"neobackstop/internals"
	"time"

	"github.com/playwright-community/playwright-go"
)

func HoverSelectors(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.HoverSelectors != nil {
		for _, hs := range scenario.HoverSelectors {
			if hs.WaitBefore != nil {
				// wait before
				time.Sleep(*hs.WaitBefore)
			}

			_, err := page.WaitForSelector(hs.Selector, playwright.PageWaitForSelectorOptions{
				State: playwright.WaitForSelectorStateAttached,
				// use default 30s timeout
			})
			if err != nil {
				e := "HoverSelector " + hs.Selector + " didn't appear"
				return &e
			}

			err = page.Hover(hs.Selector)
			if err != nil {
				e := "HoverSelector " + hs.Selector + " couldn't be hovered"
				return &e
			}

			sErr := postInteractionWait(page, scenario.PostInteractionWait)
			if sErr != nil {
				return sErr
			}

			if hs.WaitAfter != nil {
				// wait after
				time.Sleep(*hs.WaitAfter)
			}
		}
	}

	return nil
}
