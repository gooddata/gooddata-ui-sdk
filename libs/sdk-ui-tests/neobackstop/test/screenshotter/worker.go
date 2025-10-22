package screenshotter

import (
	"fmt"
	"log"
	"neobackstop/browser"
	"neobackstop/config"
	"neobackstop/internals"
	"strconv"
	"sync"

	"github.com/playwright-community/playwright-go"
)

type CurrentContext struct {
	ViewportWidth  int
	ViewportHeight int
}

func Run(saveDir string, pw *playwright.Playwright, conf config.Config, jobs chan internals.Scenario, wg *sync.WaitGroup, results chan Result, id int) {
	defer wg.Done()

	logPrefix := "screenshotter-" + strconv.Itoa(id) + " |"

	fmt.Println(logPrefix, "launching browser")

	var currentBrowser *browser.Browser
	var b playwright.Browser

	var currentContext *CurrentContext
	var c playwright.BrowserContext
	var p playwright.Page

	// iterate until channel is closed
	i := 0
	for job := range jobs {
		i++
		fmt.Println(logPrefix, "received job", i)

		// if browser is open and doesn't match job, close it
		if currentBrowser != nil && *currentBrowser != job.Browser {
			err := b.Close()
			if err != nil {
				panic(err.Error())
			}
			currentBrowser = nil
		}

		// if no browser is launched, launch one
		if currentBrowser == nil {
			var err error // init here so we can directly assign to `b`
			if job.Browser == browser.Chromium {
				b, err = pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
					Headless: playwright.Bool(true),
					Args:     conf.Args,
				})
				if err != nil {
					log.Panicf("could not launch browser: %v", err)
				}
			} else if job.Browser == browser.Firefox {
				b, err = pw.Firefox.Launch(playwright.BrowserTypeLaunchOptions{
					Headless: playwright.Bool(true),
					Args:     conf.Args,
				})
				if err != nil {
					log.Panicf("could not launch browser: %v", err)
				}
			} else {
				// this case shouldn't happen and should throw an error when unmarshalling,
				// but we should check for it anyway
				panic("Unknown browser " + job.Browser)
			}

			currentBrowser = &job.Browser
		}

		// if context is open and doesn't match job, close it
		if currentContext != nil && (currentContext.ViewportWidth != job.Viewport.Width || currentContext.ViewportHeight != job.Viewport.Height) {
			err := c.Close()
			if err != nil {
				panic(err.Error())
			}
			currentContext = nil
		}

		// if no context exists, create one, and create a page too
		if currentContext == nil {
			var err error // init here so we can directly assign to `b`
			c, err = b.NewContext(playwright.BrowserNewContextOptions{
				Viewport: &playwright.Size{
					Width:  job.Viewport.Width,
					Height: job.Viewport.Height,
				},
			})
			if err != nil {
				log.Panicf("could not create context: %v", err)
			}

			// create a new page for the newly created context
			p, err = c.NewPage()
			if err != nil {
				log.Panicf("could not create page: %v", err)
			}

			currentContext = &CurrentContext{
				ViewportWidth:  job.Viewport.Width,
				ViewportHeight: job.Viewport.Height,
			}
		}

		Job(saveDir, job.Viewport.Label, p, job, results, false)
	}

	// if no jobs, we need this case (or jobs < workers)
	if currentBrowser != nil {
		err := b.Close()
		if err != nil {
			panic(err.Error())
		}
	}

	fmt.Println(logPrefix, id, "finished")
}
