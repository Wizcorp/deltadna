# deltaDNA Web SDK

This module is an unofficial Web SDK for deltaDNA.
It uses [REST API v3](http://docs.deltadna.com/advanced-integration/rest-api/).

## Installation

```shell
npm install deltadna --save
```

## Usage

### Setup

```js
var deltadna = require('deltadna');

deltadna.setCollectUrl('http://foobar.deltadna.net/collect/api/');
deltadna.setEnvironmentKey('52146123904260546951250387412291');
deltadna.setInterval(500); // send event batches every N msec (optional)
```

### User identification

```js
deltadna.setUserId(myUserId); // identify the user
deltadna.setSessionId(mySessionId); // identify the user's session (optional)
```

### Logging events

```js
deltadna.logEvent('gameStarted', {
	userAgent: window.navigator.userAgent
});
```

## License

MIT
