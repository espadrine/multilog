module.exports = log;
var stream = require('stream');

// You affect a list of tags to each logged statement.

function log(tag, statement, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  alreadyPrinted = alreadyPrinted || {};

  if (alreadyPrinted[tag] === undefined) {
    if (log.output[tag]) {
      try {
        log.output[tag].write(statement + '\n');
      } catch(e) {}
      alreadyPrinted[tag] = true;

    } else if (log.children[tag]) {
      for (var i = 0; i < log.children[tag].length; i++) {
        log(log.children[tag][i], statement, alreadyPrinted);
      }

    } else {
      // The tag is unlisted. Create an output for it.
      newOutput(tag);
      log(tag, statement, alreadyPrinted);
    }
  }
}

// Each tag goes to a certain writer.
log.output = {
  'stdout': process.stdout,
  'stderr': process.stderr,
};

// Create a new output in the list of tags.
function newOutput(tag) {
  var logStream = new stream.Duplex({
    allowHalfOpen: false,
    decodeStrings: false,
    encoding: 'utf-8',
    highWaterMark: 0,
  });
  var logBuf = '';
  logStream._read = function(size) { logStream.push(logBuf); };
  logStream._write = function(chunk, encoding, callback) {
    logBuf += '' + chunk;
    callback(null);
  };
  log.output[tag] = logStream;
}

// Tag parenting.
//
// Every statement that is printed in a tag is also printed in
// all of its children.
//
//     log.children['major'] = ['critical'];
log.children = {};

//     log.pipe('critical', 'major');
//
//  should be read "pipe all critical statements to major".
log.pipe = function (parentTag, tag) {
  log.children[parentTag] = log.children[parentTag] || [];
  log.children[parentTag].push(tag);
};

// Print a single statement on several tags.
log.tags = function (tagList, statement, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  var alreadyPrinted = {};

  for (var i = 0; i < tagList.length; i++) {
    if (log.output[tagList[i]] && alreadyPrinted[tagList[i]] === undefined) {
      log.write(tagList[i], statement, alreadyPrinted);
    }
  }
};
