// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Marita Klein
// Date:      28.10.2011
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/foundation/object.js');

/**
 * @class
 *
 * The root class for socket-requests. Uses Socket-IO to sending end receiving messages of a socket-port.
 * functions are send(), receive() and close()
 * On first call of this methods, the connection will be initialized.
 * So all listeners (onConnect, onDisconnect, onError) should be specified at the first call.
 * Later it is not necessary, but you can override them. To clear a callback, leave it empty (e.g.: callbacks: onError:{})
 *
 * Callbacks are: onConnect, onDisconnect, onError, onMessage(for receive data)
 * Form: "callbacks: {onMessage:{target: MyApp.MyController, action: 'writeMessage'}, onError:{...}}"
 *
 * @extends M.Object
 */
M.SocketRequest = M.Object.extend(
    /** @scope M.Request.prototype */ {

        /**
         * The type of this object.
         *
         * @type String
         */
        type: 'M.SocketRequest',


        /**
         *
         */
        backOnlineFunctions: [],

        /**
         * holds all socket-connections, and corresponding channel-callbacks
         *
         * @type Object-Array
         */
        socketConnection: [],


        /**
         * indicates on/off-status, if periodically check status is enabled
         *
         * 0 = off
         * 1 = on
         * -1 = no status available
         */
        networkStatus: -1,

        /**
         * integer for set and clear the interval
         */
        networkInterval: null,

        /**
         * integer for set and clear the interval
         */
        reconnectInterval: null,


        /**
         * integer for set and clear the timeout
         */
        networkTimeout: null,

        /**
         * integer for set and clear the timeout
         */
        keepAliveTimeout: null,



        /**
         * array of sendet pings (will be deleted if pong received
         */
        pings: [],

        /**
         * responseTime of the Server (-1 == no data available)
         * only active if periodical check is enabled
         */
        responseTime: -1,

        /**
         * Timeout for the periodicall check
         */
        periodicallTimeout: 45000,

        /**
         * last responseTimes - 4 Minutes
         */
        responseArray: [],



        /**
         * sends message to given url-socket-connection and channel,
         * creates new connection if it is not yet existing.
         *
         * @param obj with structure: {url: 'http://myurl.de:8080', channel: 'message', messag: 'hi there'}
         */
        send: function(obj) {
            var socket = this.getSocket(obj.url);

            //send message
            socket.emit(obj.channel, obj.message);

            //add listeners
            if (typeof (obj.callbacks) !== 'undefined')
                this.setListener(socket, obj.callbacks);
        },

        /**
         * listen on message to given url-socket-connection and channel,
         * creates new connection if it is not yet existing.
         *
         * @param obj with structure: {url: 'http://myurl.de:8080', channel: 'message', callbacks: {onMessage:{target: MyApp.MyController, action: 'writeMessage'}}}
         */
        receive: function(obj) {
            var socket = this.getSocket(obj.url);
            var that = this;

            //remove existing listener (to override)
            socket.removeAllListeners(obj.channel);
            //socket successful connected
            socket.on(obj.channel, function (data) {
                //bind all answers to given target
                that.bindToCaller(obj.callbacks.onMessage.target, obj.callbacks.onMessage.target[obj.callbacks.onMessage.action], [data])();
            });

            //add listeners
            if (typeof (obj.callbacks) !== 'undefined')
                this.setListener(socket, obj.callbacks);


        },

        /**
         * Close the connection.
         *
         * @return Boolean indicating whether connection was closed.
         */
        close: function(obj) {
//            var socket = this.getSocket(obj.url);

            var socket = {};
            var socketArray = [];

            //search for connection
            for (var i = 0; i < this.socketConnection.length; i++) {

                var socketURL = this.socketConnection[i].socket.options.secure ? "https://" : "http://"
                    + this.socketConnection[i].socket.options.host + ':'
                    + this.socketConnection[i].socket.options.port
                    + this.socketConnection[i].name;

                //cut off end-slashes
                var currUrl = obj.url.replace(/\/+$/, '');

                //if socket-connection is matching
                if (currUrl === socketURL) {
                    socket = this.socketConnection[i];
                }
                //add to tem-array if not containing
                else {
                    socketArray.push(this.socketConnection[i]);
                }
            }
            if (typeof(socket.socket) !== 'undefined') {
                //add listeners
                if (typeof (obj.callbacks) !== 'undefined')
                    this.setListener(socket, obj.callbacks);

                socket.disconnect();
                //disconnection succsessful:
                if (socket.socket.connected === false) {
                    this.set('socketConnection', socketArray);
                }
            }
            else {
                M.Logger.log('No open connection to ' + obj.url, M.WARN);
            }
        },

        /**
         * Initiates a periodical network check
         * @param obj.url: the URL to the ping-pong server
         * @param obj.timeout (optional) between the checks, default will be 45s
         * @param obj.onStatusChanged (optional) runs this method if new status is detected or no information is available
         */
        initNetworkConnectionCheck: function(obj) {
            var socket = this.getSocket(obj.url);

            //clear all possible old intervals - only ONE is allowed
            if (this.networkInterval) {
                window.clearInterval(this.networkInterval);
                socket.removeAllListeners('p');
                socket.socket.removeAllListeners('p');
            }

            var that = this;

            //default timeout
            this.periodicallTimeout = obj.timeout ? obj.timeout : this.periodicallTimeout;

            if (this.periodicallTimeout > (2 * 60 * 1000 - 1000)) {
                M.Logger.warn('Server-timeout is 2 Minutes. ' +
                    'If your network-check interval is longer than this time, you will have to reconnect for every ping. ' +
                    'Please decrease your interval to avoid much reconnect-overhead!');
            }

            //wait for Pongs (server-answer)
            this.receivePong(socket);

            //periodically check
            this.networkInterval = window.setInterval(function() {

                //Timeout:
                var networkTimeout = window.setTimeout(function() {
                    console.log('offline!');

                    //delete interval, but start it on next online-status
                    that.backOnlineFunctions.push(function() {
                        that.initNetworkConnectionCheck(obj)
                    });
                    that.closeNetworkConnectionCheck();

                    //inform about offline-stat
                    if (obj.onStatusChanged && that.networkStatus !== 0) {
                        obj.onStatusChanged(0);
                    }
                    that.networkStatus = 0;
                    that.set('responseTime', -1);

                    //reconnect because of offline-mode
                    that.reconnect({socket: socket, executeBuffered: false});
                }, 1200);
                //always send unique number, to verify answer
                //send message
                socket.emit('p', networkTimeout);
                if (obj.onStatusChanged)
                    that.pings.push({'timeout': networkTimeout, timestamp: new Date().getTime(), onStatusChanged: obj.onStatusChanged});
                else that.pings.push({'timeout': networkTimeout, timestamp: new Date().getTime()});

            }, this.periodicallTimeout);
        },


        /**
         * Ends the periodical check on the network status
         */
        closeNetworkConnectionCheck: function() {
            window.clearInterval(this.networkInterval);
            //clear last pong-timout (dont init close two times)
//            if (this.pings)
//                window.clearTimeout(this.pings.pop().timeout);

            this.set('responseTime', -1);

            //clear pings-array
//            this.pings.length = 0;
        },


        /**
         * send one ping to check connection-health
         * @param obj.url socket-server url
         * @param obj.funct function to run if app is online
         * @param obj.cacheRequest boolean if ajax-request should be catched up
         * @param obj.keepAlive boolean if the connection should be keeping alive
         * @param obj.onOffline (optional) method, that should be executed if app is offline
         *
         */
        executeAgainstOnlineStat: function(obj) {
            var that = this;
            var socket = this.getSocket(obj.url);

            window.clearTimeout(this.keepAliveTimeout);

            var timestamp = new Date().getTime();
            this.pings.push({t: timestamp, f: obj.funct});
            //send message
            socket.emit('p', timestamp);

            this.networkTimeout = window.setTimeout(function() {
                //if offline
                if (obj.cacheRequest) {
                    //cache request
                    that.backOnlineFunctions.push(obj.funct);
                }
                if (obj.onOffline) {
                    obj.onOffline();
                }
                that.reconnect({socket: socket, executeBuffered: false});

            }, 1200);

            this.receivePong(socket);

            //new ping after 5 minutes if no new ajax-request is send
            if (obj.keepAlive) {
                this.keepAliveTimeout = window.setTimeout(function() {
                    that.executeAgainstOnlineStat({url: obj.url, funct: function() {
                    }, keepAlive: true, cacheRequest: false});
                }, (2 * 60 * 1000 - 1000));
            }

        },



        /**
         * receivePongs
         * @param socket
         */
        receivePong: function(socket) {
            var that = this;

            //delete old listeners for overriding them (make sure, to execute only one times)
            socket.removeAllListeners('p');

            //socket pong
            socket.on('p', function (data) {

            console.log('gotPong');
                //allow only one checking-periode
                window.clearTimeout(that.networkTimeout);

                //check for each ping, because one pong may be slower
                _.each(that.pings, function(ping, num) {
                    //periodic:
                    if (ping.timeout) {
                        if (data === ping.timeout) {
                            window.clearTimeout(data);
                            //calculate response-time and set network status to "active"
                            that.calculateResponseTime(new Date().getTime() - ping.timestamp);
                            //inform about status-change
                            if (ping.onStatusChanged && that.networkStatus !== 1)
                                ping.onStatusChanged(1);
                            that.networkStatus = 1;

                            //delete ping from ping-list
                            that.pings.splice(num, 1);
                        }
                    }
                    //single-check
                    else {
                        //if ping and pong matches
                        if (data === ping.t) {
                            //do ajax-request
                            ping.f();

                            //delete ping from ping-list
                            that.pings.splice(num, 1);
                        }
                    }
                });

            });
        },



        /**
         *  Checks if socket-connection still exist (in 'socketConnection',
         *  or creates a new one and adds it to this array.
         *
         *  Returns this socket-object
         * @param url
         * @return socket-object to emit and listen
         */
        getSocket: function(url) {
            var socket = {};
            var index = -1;

            //cut off end-slashes
            var currUrl = url.replace(/\/+$/, '');

//            var host = url.substr()

            //search for exsisting connection
            for (var i = 0; i < this.socketConnection.length; i++) {

                //generate url
                var socketURL = this.socketConnection[i].socket.options.secure ? "https://" : "http://"
                    + this.socketConnection[i].socket.options.host + ':'
                    + this.socketConnection[i].socket.options.port
                    + this.socketConnection[i].name;

                //if socket-connection is matching
                if (currUrl === socketURL) {
                    index = i;
                    break;
                }
            }
            //if not containing:
            if (index === -1) {
                //init secure-connection
                if (currUrl.indexOf('https') !== -1) {
                    socket = io.connect(currUrl, {secure: true});
                }
                else {
                    socket = io.connect(currUrl);
                }
                //run all "backOnline" Functions, on first connect nothing happens
                var that = this;
                socket.on('connect', function(e) {
                    _.each(that.backOnlineFunctions, function(val) {
                        val();
                    });
                    //clear array
                    that.backOnlineFunctions.length = 0;
                });
                this.socketConnection.push(socket);
            }

            //if socket-connection still exist:
            else {
                socket = this.socketConnection[index];
            }

            return socket;
        },


        /**
         * Tries a reconnects the given Socket
         * If reconnect failes, every 20 seconds a new reconnect will be tried
         * if the reconnect is successful, all "backOnlineFunctions" will be executed
         * @param obj.socket socket to reconnect
         * @param obj.executeBuffered should buffered Socket-Request executed?
         */
        reconnect: function(obj) {
            var socket = obj.socket;

            //clear old pings
            this.pings.length = 0;

            //clear old requests
            if (!obj.executeBuffered) {
                socket.socket.buffer.length = 0;
            }

            socket.socket.disconnect();
//            if (!socket.socket.reconnecting)
            socket.socket.reconnect();

        },


        /**
         * Calculate middle response time
         * of the last 4 Minutes
         *
         * @param currResponseTime
         */
        calculateResponseTime: function(currResponseTime) {
//            debugger;
            //delete old values
            if (this.responseTime === -1)
                this.responseArray.length = 0;

            //add curr Response to array
            this.responseArray.push(currResponseTime);

            var numberResponses = 0;
            if (this.periodicallTimeout < (4 * 60 * 1000)) {
                numberResponses = M.Math.round((4 * 60 * 1000) / this.periodicallTimeout);
            }

            if (this.responseArray.length > numberResponses) {
                this.responseArray.shift();
            }

            var responseTime = 0;
            var length = this.responseArray.length;
            for (var i = 0; i < length; i++) {
                responseTime += this.responseArray[i];
            }
            responseTime = responseTime / length;

            this.set('responseTime', M.Math.round(responseTime));
            console.log('response time: ', this.responseTime);
        },


        /**
         * Adds error, connected and disconnected listeners
         * (if given in obj)
         * @param socket on which to listen
         * @param obj including the callback-methods
         */
        setListener: function(socket, obj) {
            var that = this;
            //allways send error messages (M.Logger-messages)-----------------------------
            //clear existing error-callbacks:
            socket.removeAllListeners('error');
            socket.removeAllListeners('connect_failed');

            // if connection, failed:
            socket.on('error', function(e) {
                console.log('on-error');
                if (typeof(obj.onError) !== 'undefined' && typeof(obj.onError.target) !== 'undefined') {
                    that.bindToCaller(obj.onError.target, obj.onError.target[obj.onError.action], [])();
                }
                else {
                    M.Logger.log("Error occurred while Socket-connection!", M.ERR);
                }
            });

            socket.on('connect_failed', function(e) {
                console.log('on-connect_failed');
                if (typeof(obj.onError) !== 'undefined' && typeof(obj.onError.target) !== 'undefined') {
                    that.bindToCaller(obj.onError.target, obj.onError.target[obj.onError.action], [])();
                }
                else {
                    M.Logger.log("Error occurred while Socket-connection!", M.ERR);
                }
            });

//            socket.on('disconnect', function(e) {
//                console.log('on-disconnect');
//            });
//
//
//            socket.on('close', function(e) {
//                console.log('on-close');
//            });


            //------------------------------------------------------------

            //on connect
            if (typeof(obj.onConnect) !== 'undefined') {
                //delete listener (if specified)
                socket.removeAllListeners('connect');
                //add new listener (if specified --> not: onConnect: {} )
                if (typeof(obj.onConnect.target) !== 'undefined') {
                    socket.on('connect', function() {
                        that.bindToCaller(obj.onConnect.target, obj.onConnect.target[obj.onConnect.action], [])();
                    });
                }
            }

            //on disconnect
            if (typeof(obj.onDisconnect) !== 'undefined') {
                //delete listener (if specified)
                socket.removeAllListeners('disconnect');
                //add new listener (if specified --> not: onDisconnect: {} )
                if (typeof(obj.onDisconnect.target) !== 'undefined') {
                    socket.on('disconnect', function() {
                        that.bindToCaller(obj.onDisconnect.target, obj.onDisconnect.target[obj.onDisconnect.action], [])();
                    });
                }
            }
        }

    });