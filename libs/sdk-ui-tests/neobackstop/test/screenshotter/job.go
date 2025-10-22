package screenshotter

import (
	"fmt"
	"log"
	"neobackstop/internals"
	"neobackstop/screenshotter/operations"
	"strings"
	"time"

	"github.com/playwright-community/playwright-go"
)

func cleanText(text string) string {
	return strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(text, " ", "_"), "/", "_"), ",", "_")
}

func Job(saveDir string, viewportLabel string, page playwright.Page, job internals.Scenario, results chan Result, debugMode bool) {
	if _, err := page.Goto(job.Url, playwright.PageGotoOptions{
		WaitUntil: playwright.WaitUntilStateNetworkidle,
	}); err != nil {
		log.Panicf("could not goto: %v", err)
	}

	t0 := time.Now()

	// readySelector
	sErr := operations.ReadySelector(page, job.ReadySelector)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// reloadAfterReady
	sErr = operations.ReloadAfterReady(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// delay
	if debugMode {
		fmt.Println("Sleep start")
	}
	if job.Delay != nil {
		time.Sleep(job.Delay.PostReady + 2*time.Second)
	} else {
		time.Sleep(500 * time.Millisecond)
	}
	if debugMode {
		fmt.Println("Sleep end")
	}

	// keyPressSelector
	sErr = operations.KeyPressSelector(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// hoverSelector
	sErr = operations.HoverSelector(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// hoverSelectors
	sErr = operations.HoverSelectors(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// clickSelector
	sErr = operations.ClickSelector(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// clickSelectors
	sErr = operations.ClickSelectors(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	// scroll to selector
	sErr = operations.ScrollToSelector(page, job)
	if sErr != nil {
		fmt.Println(*sErr + ", exiting quietly without a screenshot")
		results <- buildResultFromScenario(job, nil, sErr)
		return
	}

	fmt.Println("operations completed in", time.Since(t0))

	if job.Delay != nil {
		time.Sleep(job.Delay.PostOperation)
	}

	_, err := page.Evaluate(`() => {
    // Disable window.onresize
    window.onresize = null;

    // Override addEventListener for resize
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'resize') return; // ignore resize listeners
        return originalAddEventListener.call(this, type, listener, options);
    };
}`)
	if err != nil {
		panic(err.Error())
	}

	_, err = page.Evaluate(`() => {
    const fullHeight = document.documentElement.scrollHeight + 'px';
    document.documentElement.style.height = fullHeight;
    document.body.style.height = fullHeight;
}`)
	if err != nil {
		panic(err.Error())
	}

	_, err = page.Evaluate(`() => {
  return new Promise(resolve => {
    setTimeout(() => requestAnimationFrame(resolve), 0);
  });
}`)
	if err != nil {
		panic(err.Error())
	}

	safeCombinedName := job.Id + "_0_document_0_" + cleanText(viewportLabel)
	fileName := "storybook_" + string(job.Browser) + "_" + safeCombinedName + ".png"

	results <- buildResultFromScenario(job, &fileName, nil)

	t1 := time.Now()

	filePath := saveDir + "/" + fileName

	fmt.Println("Saving", filePath)
	err = takeStableScreenshot(page, filePath, job.Viewport)
	if err != nil {
		log.Panicf("could not take screenshot: %v", err)
	}

	fmt.Println("saving took", time.Since(t1))

	// Move mouse outside viewport to clear any hover states
	if job.HoverSelector != nil || job.HoverSelectors != nil || job.ClickSelector != nil || job.ClickSelectors != nil {
		err = page.Mouse().Move(-1, -1)
		if err != nil {
			log.Panicf("could not move mouse to neutral position: %v", err)
		}

		_, err = page.Evaluate(`() => {
  document.querySelectorAll(":hover").forEach(el =>
    el.dispatchEvent(new MouseEvent("mouseout"))
  )
}`)
		if err != nil {
			log.Panicf("could not cleanup hovers: %v", err)
		}
	}
}
