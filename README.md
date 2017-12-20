# The standard logger for the Cagey game framework

[![Greenkeeper badge](https://badges.greenkeeper.io/cagey-framework/cagey-logger.svg)](https://greenkeeper.io/)

This is *the* standard logger for Cagey applications and plugins. It is heavily inspired by
[Bunyan](https://www.npmjs.com/package/bunyan), but differs in a few subtle ways:

- Output format is configurable, instead of only JSON. The reason for this is that signals that kill the Bunyan CLI can
  cause it to shutdown before the main application itself, dropping final log messages.
- Levels are mirrored after [Syslog severity levels](https://en.wikipedia.org/wiki/Syslog#Severity_level).
- Meta data is not mixed with the rest of the data being logged, but has a dedicated `data` property.


## Getting started

This installs cagey-logger into your project:

```sh
npm install cagey-logger --save
```

## Levels

The severity levels are directly modeled after [Syslog](https://en.wikipedia.org/wiki/Syslog#Severity_level):

nr | method name     | description
-- | --------------- | -----------
0  | log.emergency() | System is unusable.
1  | log.alert()     | Action must be taken immediately. A condition that should be corrected immediately, such as a corrupted system database.
2  | log.critical()  | Critical conditions, such as hard device errors.
3  | log.error()     | Error conditions.
4  | log.warning()   | Warning conditions.
5  | log.notice()    | Normal but significant conditions. Conditions that are not error conditions, but that may require special handling.
6  | log.info()      | Informational messages.
7  | log.debug()     | Debug-level messages. Messages that contain information normally of use only when debugging a program.

When you set your logger to, for example, level `5` it will output all log entries between 0 and 5 (inclusive). In other
words: from notices through emergencies.

## API

**factory**

You can create a logger by calling the `create` factory function on the cagey-logger module:

```js
const createLogger = require('cagey-logger').create;

const options = {
    name: 'myapp',   // the name of your application
    format: 'json',  // 'json' or 'human'
    level: 'debug'   // will only output this level and more severe levels
};

const data = {};     // properties you want all log messages to output

const log = createLogger(options, data);
```

> In the API descriptions below, we will use debug(), but every level has its own method, as described above in
> "Levels".

**log.debug(string message, [any ...args])**

Logs a simple message, and applies any extra arguments to the message string using
[util.format](https://nodejs.org/docs/latest/api/util.html#util_util_format_format_args).

Example:

```js
log.debug('User "%s" logged in', username);
```

**log.debug(Object|Array data, string message, [any ...args])**

Logs a simple message, with data attached. The data may be an object or an array with any amount depth you may wish
to apply. Certain property names will automatically apply specialized serializers that make the object more readable
or parseable.

The built-in property serializers are:

- `req`: HTTP IncomingMessage
- `error`: an Error object with a stack and optional code are assumed

Example:

```js
log.debug({ error }, 'User failed to "%s" log in', username);
```

**log.child([Object data]) -> Logger**

Creates a descendent logger, that contains the same configuration as the parent logger. You may add properties to add
context for this logger that is always present in the output of the child logger.

## License

MIT

## Credit

Cagey is developed and maintained by [Wizcorp](https://wizcorp.jp/).
