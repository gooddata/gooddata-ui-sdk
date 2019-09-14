include docker/.config
DOCKER_REGISTRY=docker-registry.na.intgdc.com
SOURCES_FILE=gooddata-react-components-web.tar.gz
# NPM_AUTH_TOKEN variable will be taken from CI env variables
.PHONY: dist
dist: clean
	docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME) \
	&& docker run --rm -e NPM_AUTH_TOKEN=$(NPM_AUTH_TOKEN) \
		-v $(CURDIR):/workspace \
		-v /tmp:/tmp \
		-w /workspace \
		-e WORKSPACE=/workspace \
		-e USERID=$(shell id -u $(USER)) \
		-e CLIENT_PATH=/workspace \
		$(DOCKER_REGISTRY)/$(IMAGE_NAME) cl-builder -p rpm-build

.PHONY: tarball
tarball: dist
	tar czvf specs/$(SOURCES_FILE) dist-storybook/

.PHONY: clean
clean:
	rm -rf dist
	rm -f $(SOURCES_FILE)
