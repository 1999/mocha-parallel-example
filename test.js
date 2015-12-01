'use strict';

var child_process = require('child_process');
var fs = require('fs');
var debug = require('debug')('kp:asynctests');
var Runner = require('./lib/runner');

// create reporter instance based on arguments
var reporterName = process.env.REPORTER || 'list';
var Reporter = require('./lib/reporter')(reporterName);

var runner = new Runner;
var testSuiteReporter = new Reporter(runner);

// now suite reporter is initialized with runner instance
// start running tests
runner.start();

var tests = fs.readdirSync(__dirname + '/test');
var testsCompleted = 0;

tests.forEach(function (testPath) {
    // run test
    var filePath = __dirname + '/test/' + testPath;
    var mochaExecutable = __dirname + '/node_modules/.bin/mocha';
    var execCommand = mochaExecutable + ' --reporter json ' + filePath;

    var child = child_process.exec(execCommand, {
        env: process.env
    });

    debug('Tests suite %s forked with PID %s', filePath, child.pid);

    child.stdout.on('data', function (stdout) {
        var jsonResponse;

        try {
            jsonResponse = JSON.parse(stdout);
        } catch (ex) {
            debug('Output from child ' + child.pid + ' is not a valid JSON');
            debug('DEBUG: %s', stdout);

            // TODO: send SIGINT to every forked process
            // this will allow to run abort() on every suite
            process.exit(1);
        }

        runner.processStdout(filePath, jsonResponse);
    });

    child.on('exit', function (code, signal) {
        debug('Child %s exited with code %s, signal %s', child.pid, code, signal);
    });
});
