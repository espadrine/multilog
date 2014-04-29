# Multilog

_a fun and collateral way to print logs_

Each statement you log is associated to a tag, and some tags can be
associated to writable streams.

You can also file tags under other tags, so that all statements in a
child tag are printed to the parent tag's writable stream!


## API

```javascript
var log = require('multilog');
```

You get the following functions:

- `log(statement, tag)` function prints `statement` in `tag` channel
  (defaulting to the special "stdout" channel).
- `log.read(tag)` returns a string of all logs in that tag.
- `log.pipe(parentTag, tag)` makes all `parentTag` statements be on the `tag`
  channel.

Advanced use:

- `log.tags(statement, tagList)` prints `statement` on multiple tags.
- `log.flush(tag)` clears all data stored in `tag` and its children.
- `log.leafTags()` gives a list of all non-piped (fundamental) buffered tags.
- `log.stream(tag)` returns a Stream for a fundamental buffered tag.

There are two special tags, `stdout` and `stderr`, which directly flush their
statements to the corresponding pipeline. All other tags are readable:

```javascript
log('myTag', 'I have something to say');
log.read('myTag');  // 'I have something to say\n'
```


## Authorship

Thaddee Tyl © 2012-2014 released under
<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/"><img
alt="Creative Commons License" style="border-width:0"
src="http://i.creativecommons.org/l/by-sa/3.0/80x15.png" /></a>.
