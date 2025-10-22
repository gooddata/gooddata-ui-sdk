package operations

import (
	"neobackstop/internals"

	"github.com/playwright-community/playwright-go"
)

func HoverSelector(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.HoverSelector != nil {
		hs := *scenario.HoverSelector

		// there is a HoverSelector, wait for it
		_, err := page.WaitForSelector(hs, playwright.PageWaitForSelectorOptions{
			State: playwright.WaitForSelectorStateAttached,
			// use default 30s timeout
		})
		if err != nil {
			e := "HoverSelector " + hs + " didn't appear"
			return &e
		}

		err = page.Hover(hs)
		if err != nil {
			e := "HoverSelector " + hs + "couldn't be hovered"
			return &e
		}

		return postInteractionWait(page, scenario.PostInteractionWait)
	}

	return nil
}
