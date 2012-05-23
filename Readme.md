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
- `log.allto(parentTag, tag)` makes all `parentTag` statements be on the `tag`
  channel.
- `log.logTags(tagList, statement)` prints `statement` on multiple tags.


## Authorship

Thaddee Tyl © 2012 released under CC-BY-SA.
<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img
alt="Creative Commons License" style="border-width:0"
src="http://i.creativecommons.org/l/by-sa/3.0/80x15.png" /></a>