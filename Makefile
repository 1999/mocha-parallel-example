all:: build

clean::
	@echo "Delete node modules"
	@rm -fr ./node_modules

build::
	@echo "Install node modules..."
	npm install --registry=http://npm.yandex-team.ru/ --loglevel=http

	@echo "Install PhantomJS..."
	brew install phantomjs

	@echo "Install standalone Selenium packages..."
	./node_modules/.bin/selenium-standalone install

run-phantom::
	phantomjs --webdriver=4444

run-selenium::
	./node_modules/.bin/selenium-standalone start

test:
	@echo "Run mocha tests..."
	REPORTER=$(REPORTER) node test.js

.PHONY: all build test run-selenium run-phantom
