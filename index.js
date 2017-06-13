'use strict';

var config = {
	dispatchInterval: 500,
	retryInterval: 2000
};

exports.setCollectUrl = function (url) {
	if (url.slice(-1) !== '/') {
		url += '/';
	}

	config.collectUrl = url;
};

exports.setEnvironmentKey = function (key) {
	config.envKey = key;
};

exports.setInterval = function (interval) {
	config.dispatchInterval = interval;
};

exports.setUserId = function (userId) {
	config.userId = userId;
};

exports.setSessionId = function (sessionId) {
	config.sessionId = sessionId;
};


function getCollectBulkUrl() {
	if (!config.collectUrl) {
		throw new Error('Collect URL is required, please call deltadna.setCollectUrl(url)');
	}

	if (!config.envKey) {
		throw new Error('Environment Key is required, please call deltadna.setEnvironmentKey(url)');
	}

	return config.collectUrl + config.envKey + '/bulk';
}


var dispatchTimer;
var newQueue = []; // the next queue to be sent
var currentQueue;  // the queue that is in-flight


function post(data) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', getCollectBulkUrl(), true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(data);

	xhr.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status >= 200 && this.status <= 299) {
				currentQueue = undefined;

				if (newQueue.length > 0) {
					dispatch();
				}
			} else if (this.status >= 500) {
				// retry
				setTimeout(function () {
					post(data);
				}, config.retryInterval);
			} else {
				currentQueue = undefined;

				throw new Error('Failed to log to DeltaDNA (HTTP Status ' + this.status + '): ' + this.responseText);
			}
		}
	};
}


function makeEventList(jsonEvents) {
	return '{"eventList":[' + jsonEvents.join(',') + ']}';
}


function dispatch() {
	if (dispatchTimer || currentQueue) {
		return;
	}

	dispatchTimer = setTimeout(function () {
		dispatchTimer = null;

		currentQueue = newQueue;
		newQueue = [];

		post(makeEventList(currentQueue));
	}, config.dispatchInterval);
}


function getTimestamp() {
	// return a timestamp in the format 2016-03-01 20:26:50.148 and in UTC
	var now = new Date();

	return now.getUTCFullYear() +
		'-' + (now.getUTCMonth() + 1) + '-' + now.getUTCDate() +
		' ' + now.getUTCHours() + ':' + now.getUTCMinutes() +
		':' + now.getUTCSeconds() + '.' + now.getUTCMilliseconds();
}


exports.logEvent = function (name, params) {
	if (!config.userId) {
		throw new Error('UserID is required, please call deltadna.setUserId(id)');
	}

	newQueue.push(JSON.stringify({
		eventName: name,
		userID: config.userId,
		sessionID: config.sessionID,
		eventTimestamp: getTimestamp(),
		eventParams: params
	}));

	dispatch();
};
