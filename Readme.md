# Multilog

_a fun and collateral way to print logs_

Each statement you log is associated to a tag, and some tags can be
associated to writable streams.

You can also file tags under other tags, so that all statements in a
child tag are printed to the parent tag's writable stream!


## API

    var log = require('multilog');

You get the following functions:

- `log(tag, statement)` function prints `statement` in `tag` channel.
- `log.output = {}` is a map from tags to writable streams.
- `log.pipe(parentTag, tag)` makes all `parentTag` statements be on the `tag`
  channel.
- `log.tags(tagList, statement)` prints `statement` on multiple tags.

There are two special tags, `stdout` and `stderr`, which directly flush their
statements to the corresponding pipeline. All other tags are readable:

    log('myTag', 'I have something to say');
    log.output.myTag.read()     // 'I have something to say\n'


## Authorship

Thaddee Tyl © 2012 released under
<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img
alt="Creative Commons License" style="border-width:0"
src="http://i.creativecommons.org/l/by-sa/3.0/80x15.png" /></a>.
