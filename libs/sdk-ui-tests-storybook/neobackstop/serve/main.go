package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/valyala/fasthttp"
)

func main() {
	storybookPath := os.Args[1]

	port := 8080

	absFolder, err := filepath.Abs(storybookPath)
	if err != nil {
		log.Fatalf("Failed to get absolute path: %v", err)
	}

	fmt.Printf("Serving Storybook static build from: %s on port %d\n", absFolder, port)

	requestHandler := func(ctx *fasthttp.RequestCtx) {
		path := absFolder + string(ctx.Path())
		if string(ctx.Path()) == "/" {
			path = absFolder + "/index.html"
		}

		fasthttp.ServeFile(ctx, path)
	}

	log.Fatal(fasthttp.ListenAndServe(fmt.Sprintf(":%d", port), requestHandler))
}
