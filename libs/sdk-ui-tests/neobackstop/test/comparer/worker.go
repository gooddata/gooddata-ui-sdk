package comparer

import (
	"fmt"
	"neobackstop/config"
	"neobackstop/screenshotter"
	"strconv"
	"sync"
)

func Run(c config.Config, jobs chan screenshotter.Result, wg *sync.WaitGroup, results chan Result, id int) {
	defer wg.Done()

	logPrefix := "comparer-" + strconv.Itoa(id) + " |"

	fmt.Println(logPrefix, "started")

	// iterate until channel is closed
	i := 0
	for job := range jobs {
		i++
		fmt.Println(logPrefix, "received job", i)

		doJob(c, job, results)
	}

	fmt.Println(logPrefix, "finished")
}
