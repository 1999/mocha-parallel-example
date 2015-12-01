'use strict';

var events = require('events');
var util = require('util');
var debug = require('debug')('kp:asynctests');
var slice = Array.prototype.slice;

function extendTestData(emitData, testData) {
    debug('Test data: %j', testData);
    debug('Emit data: %j', emitData);

    emitData.fullTitle = function () {
        return testData.fullTitle || testData.title;
    };

    emitData.slow = function () {
        return 10000;
    }
}

/**
 * Creates runner instance
 * @constructor
 */
function Runner() {}

// inherit runner objects from EventEmitter
util.inherits(Runner, events.EventEmitter);

/**
 * Emit events
 *
 * @param {String} evt - event title
 * @param {Object} test - test data
 */
Runner.prototype.emit = function Runner_emit(evt, test) {
    var args = slice.call(arguments, 2);
    var baseEmit = events.EventEmitter.prototype.emit;
    var emitArgs;

    // extend test data
    if (args.length) {
        extendTestData(args[0], test);
        emitArgs = [evt].concat(args);
    } else {
        emitArgs = slice.call(arguments, 0);
    }

    // emit data
    baseEmit.apply(this, emitArgs);
    return this;
}

Runner.prototype.start = function Runner_start() {
    this.emit('start');
};

Runner.prototype.end = function Runner_end() {
    this.emit('end');
};

/**
 * Process forked process stdout JSON
 *
 * @param {String} forked test file path
 * @param {Object} jsonResponse
 */
Runner.prototype.processStdout = function Runner_processStdout(filePath, jsonResponse) {
    this.emit('suite', null, {
        title: filePath
    });

    jsonResponse.passes.forEach(function (test) {
        this
            .emit('test', test, {
                title: test.title
            })
            .emit('pass', test, {
                title: test.title,
                duration: test.duration
            })
            .emit('test end', test, {
                title: test.title,
                fn: '[[Function]]',
                duration: test.duration
            });
    }, this);

    jsonResponse.failures.forEach(function (test) {
        this
            .emit('test', test, {
                title: test.title
            })
            .emit('fail', test, {
                title: test.title
            }, {
                message: test.err.message,
                stack: test.err.stack
            })
            .emit('test end', test, {
                title: test.title,
                duration: 0
            });
    }, this);

    jsonResponse.pending.forEach(function (test) {
        this
            .emit('test', test, {
                title: test.title
            })
            .emit('pending', test, {
                title: test.title
            }, {
                message: test.err.message,
                stack: test.err.stack
            })
            .emit('test end', test, {
                title: test.title,
                duration: test.duration || 0
            });
    }, this);

    this.emit('suite end', null, {
        title: filePath,
        startDate: new Date(jsonResponse.stats.end)
    });
};

module.exports = Runner;
