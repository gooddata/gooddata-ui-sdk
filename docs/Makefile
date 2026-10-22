PUBLIC_DIR ?= $(shell pwd)/public
#REMOTE ?= origin
#BRANCH ?= master
HUGO_GEN = hugo --cleanDestinationDir --minify
HUGO_SRV = hugo server --baseURL http://localhost
# The "local" environment makes the API reference optional: its unresolved
# links warn instead of failing the build. Only for the non-versioned serve —
# web-versions-serve needs HUGO_ENVIRONMENT=public and a -e flag would win.
HUGO_SRV_LOCAL = $(HUGO_SRV) -e local
# This controls if the output will contain the master docs or not
# If set to empty value, master docs will be removed (production mode)
KEEP_MASTER ?= keep_master

.PHONY: help
help:
	@echo "Avaliable targets:"
	@echo "  web                - generates non-versioned docs to ${PUBLIC_DIR}"
	@echo "  web-serve          - runs local web server with non-versioned docs"
	@echo "  web-versions       - generates versioned docs to ${PUBLIC_DIR}"
	@echo "  web-versions-serve - runs local web server with versioned docs"
	@echo "  api-reference      - generates the API reference into content/en (needs a built SDK or SDK_LIBS_DIR)"
	@echo "                       web-serve skips it when no api model is present; see CONTENT_PIPELINE.md"
	@echo "Both versioned targets require env variables REMOTE and BRANCH to be set."
	@echo "  REMOTE - git remote where other versioned branches are stored (e.g. origin, upstream)"
	@echo "  BRANCH - name of BASE branch for proposed changes (e.g. master, rel/0.7,...)"

.PHONY: check-env
check-env:
ifeq ($(REMOTE),)
	@echo >&2 "REMOTE variable must be set"; exit 1
endif

ifeq ($(BRANCH),)
	@echo >&2 "BRANCH variable must be set"; exit 1
endif

.PHONY: npm_install
npm_install:
	npm install

.PHONY: gen-versions
gen-versions: check-env
	@echo "Generating versioned docs from remote=${REMOTE}"
	@echo "Asuming local branch based on ${BRANCH}"
	../scripts/generate.sh $(REMOTE) $(BRANCH) $(KEEP_MASTER)

.PHONY: api-reference
api-reference:
	@echo "Generating API reference for content/en"
	../scripts/build-api-reference.sh content/en

# Same, but a missing api model is a warning rather than a stop — used by the
# *-serve targets so `make web-serve` works on a fresh checkout.
.PHONY: api-reference-optional
api-reference-optional: export API_REFERENCE_OPTIONAL=1
api-reference-optional:
	@echo "Generating API reference for content/en (optional)"
	../scripts/build-api-reference.sh content/en

.PHONY: api-reference-versions
api-reference-versions:
	@echo "Generating API reference for the newest versions in versioned_docs"
	../scripts/build-api-reference-versions.sh versioned_docs

.PHONY: web
web: npm_install api-reference
	@echo "Generating non-versioned documentation from current branch"
	$(HUGO_GEN)

.PHONY: web-serve
web-serve: npm_install api-reference-optional
	@echo "Serving hugo site with non-versioned documentation from current branch"
	$(HUGO_SRV_LOCAL)

.PHONY: web-versions
web-versions: export HUGO_ENVIRONMENT=public
web-versions: npm_install gen-versions api-reference-versions
	@echo "Generating VERSIONED documentation from current branch"
	$(HUGO_GEN)

.PHONY: web-versions-serve
web-versions-serve: export HUGO_ENVIRONMENT=public
web-versions-serve: npm_install gen-versions api-reference-versions
	@echo "Serving hugo site with VERSIONED documentation from current branch"
	$(HUGO_SRV)
