// Example of use.
var log = require('./log');
var assert = require('assert');

function nl(msgs) {
  return msgs.join('\n') + '\n';
}

// Assume three compartments: checkpoint, assert and bug.
// bug → stdout
// bug → assert
// checkpoint → assert
log.pipe('bug', process.stdout);
log.pipe('checkpoint', 'assert');
log.pipe('bug', 'assert');
log.retain('assert');
log.retain('checkpoint');

var bugMsg = "This message is sent to bug.";
log(bugMsg, 'bug');
assert.equal(log.read('assert'), nl([bugMsg]), "Bug did not pipe to assert");

var checkpointMsg = "This message is sent to checkpoint.";
log(checkpointMsg, 'checkpoint');
assert.equal(log.read('assert'), nl([bugMsg, checkpointMsg]),
    "checkpoint did not pipe to assert");

log.flush('assert');
assert.equal(log.read('assert'), '', "Bug did not flush");
assert.equal(log.read('checkpoint'), '', "Bug did not flush parent");

var unpipeMsg = "This should not be in assert";
log.unpipe('bug', 'assert');
log(unpipeMsg, 'bug');
assert.equal(log.read('assert'), '',
    "unpipe should avoid logs flowing through");

log.unpipe('bug', process.stdout);
var unpipeMsg = "This should not land in stdout";
log.unpipe('bug', 'assert');
log(unpipeMsg, 'bug');
assert.equal(log.read('assert'), '',
    "unpipe should avoid logs flowing through once.");
