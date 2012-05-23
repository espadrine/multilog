module.exports = log;

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
    }

    if (log.children[tag]) {
      for (var i = 0; i < log.children[tag].length; i++) {
        log(log.children[tag][i], statement, alreadyPrinted);
      }
    }
  }
}

// Each tag goes to a certain writer.
log.output = {
  'stdout': process.stdout,
  'stderr': process.stderr,
};

// Tag parenting.
//
// Every statement that is printed in a tag is also printed in
// all of its children.
//
//     log.children['major'] = ['critical'];
log.children = {};

//     log.allto('critical', 'major');
//
//  should be read "log all critical statements to major".
log.allto = function (parentTag, tag) {
  log.children[parentTag] = log.children[parentTag] || [];
  log.children[parentTag].push(tag);
};

// Print a single statement on several tags.
log.logTags = function (tagList, statement, alreadyPrinted) {

  // List of all tags that have already been used for that statement.
  var alreadyPrinted = {};

  for (var i = 0; i < tagList.length; i++) {
    if (log.output[tagList[i]] && alreadyPrinted[tagList[i]] === undefined) {
      log.write(tagList[i], statement, alreadyPrinted);
    }
  }
};
