PUBLIC_DIR ?= $(shell pwd)/public
#REMOTE ?= origin
#BRANCH ?= master
HUGO_GEN = hugo --cleanDestinationDir --minify && ../scripts/htmltest
HUGO_SRV = hugo server --baseURL http://localhost
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
	# Update docsy theme and all submodules within it
	git submodule update --init --recursive --depth 1
	npm install

.PHONY: gen-versions
gen-versions: check-env
	@echo "Generating versioned docs from remote=${REMOTE}"
	@echo "Asuming local branch based on ${BRANCH}"
	../scripts/generate.sh $(REMOTE) $(BRANCH) $(KEEP_MASTER)

.PHONY: web
web: npm_install
	@echo "Generating non-versioned documentation from current branch"
	$(HUGO_GEN)

.PHONY: web-serve
web-serve: npm_install
	@echo "Serving hugo site with non-versioned documentation from current branch"
	$(HUGO_SRV)

.PHONY: web-versions
web-versions: export HUGO_ENVIRONMENT=public
web-versions: npm_install gen-versions
	@echo "Generating VERSIONED documentation from current branch"
	$(HUGO_GEN)

.PHONY: web-versions-serve
web-versions-serve: export HUGO_ENVIRONMENT=public
web-versions-serve: npm_install gen-versions
	@echo "Serving hugo site with VERSIONED documentation from current branch"
	$(HUGO_SRV)
