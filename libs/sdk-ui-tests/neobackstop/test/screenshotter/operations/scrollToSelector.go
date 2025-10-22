package operations

import (
	"neobackstop/internals"

	"github.com/playwright-community/playwright-go"
)

func ScrollToSelector(page playwright.Page, scenario internals.Scenario) *string {
	if scenario.ScrollToSelector != nil {
		sts := *scenario.ScrollToSelector

		// Wait for the element first
		_, err := page.WaitForSelector(sts, playwright.PageWaitForSelectorOptions{
			State:   playwright.WaitForSelectorStateVisible,
			Timeout: playwright.Float(10000),
		})
		if err != nil {
			e := "ScrollToSelector " + sts + " not found"
			return &e
		}

		// Scroll element into view
		_, err = page.EvalOnSelector(sts, `el => el.scrollIntoView({ behavior: "instant", block: "center" })`, nil)
		if err != nil {
			e := "Failed to scroll element into view: " + err.Error()
			return &e
		}

		return postInteractionWait(page, scenario.PostInteractionWait)
	}

	return nil
}
