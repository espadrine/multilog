// Example of use.
var log = require('./log');

// Specify two compartments, log and allto.
log.allto('log', 'stdout');
log.allto('allto', 'stdout');

log('log', "Trying a log");
log('allto', "Testing allto");

// Specify a subcompartment.
log.allto('parenting', 'allto');

log('parenting', "Testing parenting");
