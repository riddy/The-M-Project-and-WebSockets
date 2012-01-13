// ==========================================================================
// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2010 M-Way Solutions GmbH. All rights reserved.
//            (c) 2011 panacoda GmbH. All rights reserved.
// Creator:   Marita Klein
// Date:      09.01.2012
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

m_require('core/foundation/request.js');

/**
 * @class
 *
 * The root class for every request. Makes ajax requests. Is used e.g. for querying REST web services.
 * First M.Request.init needs to be called, then send.
 *
 * @extends M.Request
 */
M.ConnectionCheckRequest = M.Request.extend(
    /** @scope M.Request.prototype */ {

        /**
         * defines the URL to the Socket-Server for connection-check
         *
         */
        socketUrl: null,

        /**
         * Method to execute if application is offline
         */
        onOffline: null,

        /**
         * Bool if the Request should be cached or not
         */
        cacheRequest: NO,

        /**
         * Bool if socket-connection should be "keepAlive"
         */
        keepSocketConnectionAlive: YES,

        /**
         * Initializes a request. Sets the parameter of this request object with the passed values.
         *
         * @param {Object} obj The parameter object. Includes:
         * * method: the http method to use, e.g. 'POST'
         * * url: the request url, e.g. 'twitter.com/search.json' (needs a proxy to be set because of Same-Origin-Policy)
         * * isAsync: defines whether request should be made async or not. defaults to YES. Should be YES.
         * * isJSON: defines whether to process request and response as JSON
         * * timout: defines timeout in milliseconds
         * * data: the data to be transmitted
         * * beforeSend: callback that is called before request is sent
         * * onError: callback that is called when an error occured
         * * onSuccess: callback that is called when request was successful
         * * socketUrl: URL for connection to the socket-server
         * * onOffline: (optional) method to execute if the app is offline
         * * cacheRequest: Boolean if the request should be executed if app is back online (and is offline now) default is NO
         * * keepSocketConnectionAlive: Boolean if the Socket-Connection should be send heartbeats to keep the tcp-connection alive
         * *                            if no new ajax-request (with connection-check) is send.  reconnect causes more overhead.
         * *                            default is YES
         */
        init: function(obj) {
            obj = obj ? obj : {};
            return this.extend({
                method: obj['method'] ? obj['method'] : this.method,
                url: obj['url'] ? obj['url'] : this.url,
                isAsync: obj['isAsync'] ? obj['isAsync'] : this.isAsync,
                isJSON: obj['isJSON'] ? obj['isJSON'] : this.isJSON,
                timeout: obj['timeout'] ? obj['timeout'] : this.timeout,
                data: obj['data'] ? obj['data'] : this.data,
                beforeSend: obj['beforeSend'] ? obj['beforeSend'] : this.beforeSend,
                onError: obj['onError'] ? obj['onError'] : this.onError,
                onSuccess: obj['onSuccess'] ? obj['onSuccess'] : this.onSuccess,
                socketUrl: obj['socketUrl'] ? obj['socketUrl'] : this.socketUrl,
                onOffline: obj['onOffline'] ? obj['onOffline'] : this.onOffline,
                cacheRequest: obj['cacheRequest'] ? obj['cacheRequest'] : this.cacheRequest,
                keepSocketConnectionAlive: obj['keepSocketConnectionAlive'] ? obj['keepSocketConnectionAlive'] : this.keepSocketConnectionAlive

            });
        },


        /**
         *
         * Needs init first!
         * Checks connectivity within a socket-server.
         *
         */
        send: function() {
            M.SocketRequest.executeAgainstOnlineStat({
                url: this.socketUrl,
                funct: this.sendAjax,
                cacheRequest: this.cacheRequest,
                onOffline: this.onOffline,
                keepSocketConnectionAlive: this.keepSocketConnectionAlive
            });
        },

        /**
         * Sends an Ajax request by using jQuery's $.ajax().
         */
        sendAjax: function() {
            this.request = $.ajax({
                type: this.method,
                url: this.url,
                async: this.isAsync,
                dataType: this.isJSON ? 'json' : 'text',
                timeout: this.timeout,
                data: this.data ? this.data : '',
                context: this,
                beforeSend: this.beforeSend,
                success: this.onSuccess,
                error: this.onError
            });
        }


});