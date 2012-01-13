// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// Controller: ChatController
// ==========================================================================

MySocketTest.SocketRequestController = M.Controller.extend({

    socketrequestList: null,
    socket: {},
    chat: '',
    times: 0,

    init: function(isFirstLoad) {
        if (isFirstLoad) {
            var socketrequestList = [
                {
                    name: "Chat sample",
                    page: "socketchat"
                },

                {
                    name: "Network check sample",
                    page: "socketnetwork"
                }
            ];
            this.set('socketrequestList', socketrequestList);
        }
    },

    socketRequestSelected: function(id) {
        var socketRequestName = M.ViewManager.getView(id, 'name').value;
        var socket = _.detect(this.socketrequestList, function(s) {
            return s.name === socketRequestName;
        });

        this.switchToPage(socket.page);
    },

    toSocketPage: function() {
        this.switchToPage('socketRequestView', M.TRANSITION.SLIDE, YES);
    },

    initChat: function(isFirstLoad) {

        if (isFirstLoad) {
            this.set('chat', '<h4>Welcome to the Chat</h4>');
            this.set('times', 0);

            M.SocketRequest.receive({url: 'http://localhost:8080', channel: 'message',callbacks:{onMessage:{target:this,action:'getMessage'}, onDisconnect:{target:this, action: 'loggedOff'}}});
            M.SocketRequest.receive({url: 'http://localhost:8080/', channel: 'newmember',callbacks: {onMessage:{target:this,action:'getMember'}}});
            M.SocketRequest.receive({url: 'http://localhost:8080/', channel: 'membergone',callbacks: {onMessage:{target:this,action:'memberGone'}}});
        }
    },


    sendMessage: function(view) {

        if (M.ViewManager.getView('socketchat', 'nick').isEnabled) {
            M.DialogView.alert({
                title: 'Login first',
                message: 'Please login to participate in chat.'
            });
        }
        else {
            view = M.ViewManager.getViewById(view);
            M.SocketRequest.send({url: 'http://localhost:8080/', channel: 'message',message: view.value});
            view.setValue('');
        }
    },


    login: function(view) {
        view = M.ViewManager.getView('socketchat', 'nick');

        M.SocketRequest.send({url: 'http://127.0.0.1:8080/', channel: 'nickname',message: view.value});

        view.disable();
    },

    getMessage: function (data) {
        console.log(data);

        var newChat = this.chat + data + '<br/>';
        this.set('chat', newChat);
    },

    getMember: function (data) {
        var newChat = this.chat + '<i>' + data + '</i><br/>';
        console.log(newChat);
        this.set('chat', newChat);
    },

    memberGone: function (data) {
        var newChat = this.chat + '<i>' + data + '</i><br/>';
        console.log(newChat);
        this.set('chat', newChat);
    },


    disconnect: function() {
        M.SocketRequest.close({url: 'http://localhost:8080/', callbacks: {onDisconnect:{target:this, action: 'loggedOff'}}});
    },

    loggedOff: function() {
        var view = M.ViewManager.getView('socketchat', 'nick');
//        view.setValue('');
        view.enable();
        this.set('chat', '<h4>Welcome to the Chat</h4>' + '<i> you logged off </i><br/>');
    }
});