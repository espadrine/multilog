module.exports = log;
var stream = require('stream');

// You affect a list of tags to each logged statement.

function log(tag, statement, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  alreadyPrinted = alreadyPrinted || {};

  if (alreadyPrinted[tag] === undefined) {
    if (logOutput[tag]) {
      try {
        logOutput[tag].write(statement + '\n');
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
var logOutput = {
  'stdout': process.stdout,
  'stderr': process.stderr,
};

log.leafTags = function() {
  var tags = [];
  for (var tag in logOutput) {
    if (tag !== 'stdout' && tag !== 'stderr') { tags.push(tag); }
  }
  return tags;
};

// Contains all the logs of readable outputs.
// List of instances of Msg.
var logBuf = [];

function Msg(tag, msg) {
  this.stamp = +new Date();
  this.tag = tag;
  this.msg = msg;
}

function logMsg(tag, msg) {
  logBuf.push(new Msg(tag, msg));
}
function readOutput(tag) {
  var output = '';
  for (var i = 0; i < logBuf.length; i++) {
    if (logBuf[i].tag === tag) {
      output += logBuf[i].msg;
    }
  }
  return output;
}

// Create a new output in the list of tags.
function newOutput(tag) {
  // FIXME: is it still necessary, given log.read(), to be readable?
  var logStream = new stream.Duplex({
    allowHalfOpen: false,
    decodeStrings: false,
    encoding: 'utf-8',
    highWaterMark: 0,
  });
  logStream._read = function(size) { logStream.push(readOutput(tag)); };
  logStream._write = function(chunk, encoding, callback) {
    logMsg(tag, '' + chunk);
    callback(null);
  };
  logOutput[tag] = logStream;
}

// Read all data from a tag.
log.read = function(tag) {
  // Unline readOutput, any tag can be specified.
  var set = family(tag);
  var output = '';
  for (var i = 0; i < logBuf.length; i++) {
    // If the log's tag belongs to the family…
    if (!!set[logBuf[i].tag]) {
      output += logBuf[i].msg;
    }
  }
  return output;
};

// Remove data associated with a tag.
log.flush = function(tag) {
  // Unline readOutput, any tag can be specified.
  var set = family(tag);
  var newBuf = [];
  for (var i = 0; i < logBuf.length; i++) {
    // If the log's tag belongs to the family…
    if (!set[logBuf[i].tag]) {
      newBuf.push(logBuf[i]);
    }
  }
  logBuf = newBuf;
};


// Tag parenting.
//
// Every statement that is printed in a tag is also printed in
// all of its children.
//
//     log.children['critical'] = ['major'];
log.children = {};

//     family('critical')   // {'major': true}
//
// Return a list of children and their own families.
function family(tag, alreadyRead) {
  var set = alreadyRead || Object.create(null);
  set[tag] = true;
  if (log.children[tag] !== undefined) {
    for (var i = 0; i < log.children[tag].length; i++) {
      // if that child hasn't already been visited…
      if (!set[log.children[tag][i]]) {
        family(log.children[tag][i], set);
      }
    }
  }
  return set;
}

//     log.pipe('critical', 'major');
//
// …should be read "pipe all critical statements to major".
log.pipe = function (parentTag, tag) {
  log.children[parentTag] = log.children[parentTag] || [];
  log.children[parentTag].push(tag);
};

// Print a single statement on several tags.
log.tags = function (tagList, statement, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  var alreadyPrinted = {};

  for (var i = 0; i < tagList.length; i++) {
    if (logOutput[tagList[i]] && alreadyPrinted[tagList[i]] === undefined) {
      log.write(tagList[i], statement, alreadyPrinted);
    }
  }
};
