# Multilog

_a fun and collateral way to print logs_

Each statement you log is associated to a tag, and some tags can be
associated to writable streams.

You can also file tags under other tags, so that all statements in a
child tag are printed to the parent tag's writable stream!


## API

```js
var log = require('multilog');
log('Curse your sudden but inevitable betrayal!', 'stderr');
```

You get the following functions:

- `log(statement, tag)` function prints `statement` in `tag` channel
  (defaulting to the special "stdout" channel).
- `log.pipe(parentTag, tag)` makes all `parentTag` statements be on the `tag`
  channel.

By default, pipes flow into void.

You can connect them to [a writable stream][Stream]
with `log.pipe(tag, process.stdout)`.

You can also ask that their logs be retained with `log.retain(tag)`.
You can then read from them (and from all tags that feeds to them)
through `log.read(tag)`, and flush the memory with `log.flush(tag)`.

Advanced use:

- `log.tags(statement, tagList)` prints `statement` on multiple tags.
- `log.stream(tag)` returns a duplex [Stream][] for a retained tag.

There are two special tags, `stdout` and `stderr`, which directly flush their
statements to the corresponding pipeline.

[Stream]: http://nodejs.org/api/stream.html


## Authorship

Thaddee Tyl © 2012-2014 released under
<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img
alt="Creative Commons License" style="border-width:0"
src="http://i.creativecommons.org/l/by-sa/3.0/80x15.png" /></a>.
