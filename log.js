module.exports = log;
var stream = require('stream');

// You affect a list of tags to each logged statement.

function log(statement, tag, alreadyPrinted) {
  tag = tag || 'stdout';

  // List of all tags that have already been used for that statement.
  alreadyPrinted = alreadyPrinted || {};

  if (alreadyPrinted[tag] === undefined) {
    if (logOutput[tag]) {
      try {
        logOutput[tag].write(statement + '\n');
      } catch(e) {}
    }
    if (logRetained[tag]) {
      try {
        logRetained[tag].write(statement + '\n');
      } catch(e) {}
      alreadyPrinted[tag] = true;
    } else if (log.children[tag]) {
      for (var i = 0; i < log.children[tag].length; i++) {
        log(statement, log.children[tag][i], alreadyPrinted);
      }

    } else {
      // The tag is unlisted. Discard the statement.
      // The user could have created an output for it
      // with `log.retain('RAM log')`.
      // Then, they can read it: `log.read('RAM log')`.
    }
  }
}

// Each tag goes to a certain writer.
var logOutput = {
  'stdout': process.stdout,
  'stderr': process.stderr,
};
var logRetained = {};

log.stream = function(tag) { return logRetained[tag]; };

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
log.retain = function newOutput(tag) {
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
  logRetained[tag] = logStream;
  return tag;
}

// Read all data from a tag.
log.read = function(tag) {
  // Unline readOutput, any tag can be specified.
  var set = ancestry(tag);
  var output = '';
  for (var i = 0; i < logBuf.length; i++) {
    // If the log's tag belongs to the ancestry…
    if (!!set[logBuf[i].tag]) {
      output += logBuf[i].msg;
    }
  }
  return output;
};

// Remove data associated with a tag.
log.flush = function(tag) {
  // Unline readOutput, any tag can be specified.
  var set = ancestry(tag);
  var newBuf = [];
  for (var i = 0; i < logBuf.length; i++) {
    // If the log's tag doesn't belong to the ancestry…
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
//     log.parents['major'] = ['critical'];
log.children = {};
log.parents = {};

//     family('critical')   // {'critical': true, 'major': true}
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

//     ancestry('major')   // {'major': true, 'critical': true}
//
// Return a list of parents and their own ancestry.
function ancestry(tag, alreadyRead) {
  var set = alreadyRead || Object.create(null);
  set[tag] = true;
  if (log.parents[tag] !== undefined) {
    for (var i = 0; i < log.parents[tag].length; i++) {
      // if that parent hasn't already been visited…
      if (!set[log.parents[tag][i]]) {
        ancestry(log.parents[tag][i], set);
      }
    }
  }
  return set;
}

//     log.pipe('critical', 'major');
//
// …should be read "pipe all critical statements to major".
log.pipe = function (parentTag, tag) {
  if (tag instanceof stream.Writable || tag instanceof stream.Duplex) {
    logOutput[parentTag] = tag;
  } else {
    // It is a normal tag.
    log.parents[tag] = log.parents[tag] || [];
    log.parents[tag].push(parentTag);
    log.children[parentTag] = log.children[parentTag] || [];
    log.children[parentTag].push(tag);
  }
};

// Print a single statement on several tags.
log.tags = function (statement, tagList, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  var alreadyPrinted = {};

  for (var i = 0; i < tagList.length; i++) {
    if (alreadyPrinted[tagList[i]] === undefined) {
      log(statement, tagList[i], alreadyPrinted);
    }
  }
};
