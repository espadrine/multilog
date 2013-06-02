// Example of use.
var log = require('./log');

// Specify two compartments, log and pipe.
log.pipe('log', 'stdout');
log.pipe('pipe', 'stdout');

log('log', "Trying a log");
log('pipe', "Testing pipe");

// Specify a subcompartment.
log.pipe('parenting', 'pipe');

log('parenting', "Testing parenting");
