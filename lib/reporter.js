'use strict';

module.exports = function (reporterName) {
    var Reporter;

    try {
        Reporter = require('mocha/lib/reporters/' + reporterName);
    } catch (ex) {
        try {
            Reporter = require(reporterName);
        } catch (ex) {
            throw new Error('Reporter "' + reporterName + '" does not exist');
        }
    }

    return Reporter;
};
