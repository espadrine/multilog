// Example of use.
var log = require('./log');
var assert = require('assert');

// Assume three compartments: checkpoint, assert and bug.
// bug → stdout
// checkpoint → assert
// bug → assert
log.pipe('bug', 'stdout');
log.pipe('checkpoint', 'assert');
log.pipe('bug', 'assert');

var bugMsg = "This message is sent to bug.";
log('bug', bugMsg);
assert.equal(log.read('assert'), bugMsg + '\n', "Bug did not pipe to assert");

var checkpointMsg = "This message is sent to bug.";
log('checkpoint', checkpointMsg);
assert.equal(log.read('assert'), bugMsg + '\n' + checkpointMsg + '\n',
    "checkpoint did not pipe to assert");
