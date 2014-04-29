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
log.pipe('bug', 'stdout');
log.pipe('checkpoint', 'assert');
log.pipe('bug', 'assert');

var bugMsg = "This message is sent to bug.";
log(bugMsg, 'bug');
assert.equal(log.read('assert'), nl([bugMsg]), "Bug did not pipe to assert");

var checkpointMsg = "This message is sent to bug.";
log(checkpointMsg, 'checkpoint');
assert.equal(log.read('assert'), nl([bugMsg, checkpointMsg]),
    "checkpoint did not pipe to assert");

log.flush('bug');
assert.equal(log.read('assert'), '', "Bug did not flush");
assert.equal(log.read('checkpoint'), '', "Bug did not flush parent");

// Test the leafTags.
assert.equal(log.leafTags()[0], 'assert', "Leaf tags are detected.");
