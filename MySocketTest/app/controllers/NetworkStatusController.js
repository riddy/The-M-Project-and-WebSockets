// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// Controller: ChatController
// ==========================================================================

MySocketTest.NetworkStatusController = M.Controller.extend({

    status: '',
    responseTime: '',
    buttonVisible: false,

    init: function(isFirstLoad) {

        if (isFirstLoad) {
            this.set('status', 'No Network-Data available');
            this.buttonVisible = false;
        }
    },

    periodCheck: function(view) {
        M.SocketRequest.initNetworkConnectionCheck({url: 'http://localhost:8080/', timeout: 2000, onStatusChanged: this.statusChanged});

        if (!this.buttonVisible) {
            var view = M.ViewManager.getView('socketnetwork', 'checkResponseTime');
            view.toggleView();
            this.buttonVisible = true;
        }

    },

    statusChanged: function(data) {
        var status = '';
        var view = M.ViewManager.getView('socketnetwork', 'status');
        if (data === -1)
            status = '';
        else if (data === 0) {
            status = 'You are offline..';
            $('#' + view.id).removeClass('networkOnline');
            $('#' + view.id).addClass('networkOffline');
        }
        else if (data === 1) {
            status = 'You are online!';
            $('#' + view.id).removeClass('networkOffline');
            $('#' + view.id).addClass('networkOnline');

        }
        MySocketTest.NetworkStatusController.set('status', status);
    },

    checkOnce: function(view) {
        var that = this;
        var view = M.ViewManager.getView('socketnetwork', 'status');
        M.SocketRequest.executeAgainstOnlineStat({
            url: 'http://localhost:8080',
            funct: function() {
                that.set('status', 'You are online!');

                $('#' + view.id).removeClass('networkOffline');
                $('#' + view.id).addClass('networkOnline');

            }, keepAlive: false,
            onOffline: function() {
                that.set('status', 'offline: reconnecting...');

                $('#' + view.id).removeClass('networkOnline');
                $('#' + view.id).addClass('networkOffline');
            },
            cacheRequest: true
        });
    },

    stopPeriodCheck: function(view) {
        M.SocketRequest.closeNetworkConnectionCheck();
        this.set('responseTime', ' ');
        if (this.buttonVisible) {
            var view = M.ViewManager.getView('socketnetwork', 'checkResponseTime');
            view.toggleView();
            this.buttonVisible = false;
        }
    },


    disconnect: function() {
        M.SocketRequest.close({url: 'http://localhost:8080/', callbacks: {onDisconnect:{target:this, action: 'loggedOff'}}});
    },

    getResponse: function() {
        this.set('responseTime', 'Response time of peridic check: ' + M.SocketRequest.responseTime);
    },

    loggedOff: function() {
        this.set('status', 'You are offline..');
        this.set('responseTime', ' ');

        var view = M.ViewManager.getView('socketnetwork', 'status');
        $('#' + view.id).removeClass('networkOnline');
        $('#' + view.id).addClass('networkOffline');
    }


});