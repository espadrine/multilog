var log = require('./log');

log.allto('log', 'stdout');
log.allto('allto', 'stdout');

log('log', "Trying a log");
log('allto', "Testing allto");

log.allto('parenting', 'allto');

log('parenting', "Testing parenting");
