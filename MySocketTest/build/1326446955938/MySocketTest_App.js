
// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// Controller: ChatController
// ==========================================================================

MySocketTest.ChatController = M.Controller.extend({

    socket: {},
    chat: '',
    times: 0,

    init: function(isFirstLoad) {

        if (isFirstLoad) {
            this.set('chat', '<h4>Welcome to the Chat</h4>');
            this.set('times', 0);

            M.SocketRequest.receive({url: 'http://10.21.1.131:8080', channel: 'message',callbacks:{onMessage:{target:this,action:'getMessage'}}});
            M.SocketRequest.receive({url: 'http://10.21.1.131:8080/', channel: 'newmember',callbacks: {onMessage:{target:this,action:'getMember'}}});
            M.SocketRequest.receive({url: 'http://10.21.1.131:8080/', channel: 'membergone',callbacks: {onMessage:{target:this,action:'memberGone'}}});
//            M.SocketRequest.receive({url: 'http://127.0.0.1:8080/', channel: 'pong',callbacks: {onMessage:{target:this,action:'pong'}}});
        }
    },


    sendMessage: function(view) {

        M.SocketRequest.closeNetworkConnectionCheck();

        if (M.ViewManager.getView('chatPage', 'nick').isEnabled) {
            M.DialogView.alert({
                title: 'Login first',
                message: 'Please login to participate in chat.'
            });
        }
        else {
            view = M.ViewManager.getViewById(view);
            M.SocketRequest.send({url: 'http://10.21.1.131:8080/', channel: 'message',message: view.value});
            view.setValue('');
        }
    },


    login: function(view) {
        view = M.ViewManager.getView('chatPage', 'nick');

//        var socket = this.socket;
//        M.SocketRequest.send({url: 'http://127.0.0.1:8080/', channel: 'nickname',message: view.value});
        M.SocketRequest.send({url: 'http://10.21.1.131:8080/', channel: 'p', message: new Date().getTime()});

//        view.disable();
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
        M.SocketRequest.close({url: 'http://10.21.1.131:8080/', callbacks: {onDisconnect:{target:this, action: 'loggedOff'}}});
    },

    loggedOff: function() {
        console.log('logged off');
    }




});
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
// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// View: ChatPage
// ==========================================================================

MySocketTest.SocketRequestChatSample = M.PageView.design({

    /* Use the 'events' property to bind events like 'pageshow' */
    events: {
        pageshow: {
            target: MySocketTest.SocketRequestController,
            action: 'initChat'
        }
    },

    childViews: 'header content footer',

    header: M.ToolbarView.design({
        childViews: 'backButton title logoff',

        backButton: M.ButtonView.design({
            value: 'Back',
            icon: 'arrow-l',
            anchorLocation: M.LEFT,
            events: {
                tap:{
                    target: MySocketTest.SocketRequestController,
                    action: 'toSocketPage'
                }
            }
        }),
        logoff: M.ButtonView.design({
            value: 'Log off',
            icon: 'delete',
            anchorLocation: M.RIGHT,
            events: {
                tap:{
                    target: MySocketTest.SocketRequestController,
                    action: 'disconnect'
                }
            }
        }),

        title: M.LabelView.design({
            value: 'Socket-Chat',
            anchorLocation: M.CENTER
        }),

        anchorLocation: M.TOP
    }),

    content: M.ScrollView.design({
        childViews: 'nick login chat',
        nick: M.TextFieldView.design({
            events: {
                enter: {
                    target: MySocketTest.SocketRequestController,
                    action: 'login'
                }
            },
            cssClass: 'nickname'
        }),
        login: M.ButtonView.design({
            value: 'Login',
            events: {
                tap: {
                    target: MySocketTest.SocketRequestController,
                    action: 'login'
                }
            },
            cssClass: 'loginBtn'
        }),
        chat: M.LabelView.design({
            contentBinding: {
                target: MySocketTest.SocketRequestController,
                property: 'chat'
            }
        })
    }),
    footer: M.ToolbarView.design({
        childViews: 'input',
        input: M.TextFieldView.design({
            events: {
                enter: {
                    target: MySocketTest.SocketRequestController,
                    action: 'sendMessage'
                }
            },
            initialText: 'Message',
            cssClassOnInit: 'initCss',
            anchorLocation: M.LEFT

        }),
        anchorLocation: M.BOTTOM
    })



});


// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// View: SocketRequestView
// ==========================================================================

MySocketTest.SocketRequestNetworkCheck = M.PageView.design({


    events: {
        pageshow:{
            target: MySocketTest.NetworkStatusController,
            action: 'init'
        }},

    childViews: 'header content',

    header: M.ToolbarView.design({
        childViews: 'backButton title checkResponseTime',

        backButton: M.ButtonView.design({
            value: 'Back',
            icon: 'arrow-l',
            anchorLocation: M.LEFT,
            events: {
                tap:{
                    target: MySocketTest.SocketRequestController,
                    action: 'toSocketPage'
                }
            }
        }),
        checkResponseTime: M.ToggleView.design({
            anchorLocation: M.RIGHT,
            childViews: 'none networkQuality',
            networkQuality: M.ButtonView.design({
                value: 'NetQuality',
                icon: 'refresh',
                events: {
                    tap:{
                        target: MySocketTest.NetworkStatusController,
                        action: 'getResponse'
                    }
                }
            }),
            none: M.ContainerView.design({

            })
        }),



        title: M.LabelView.design({
            value: 'Network check',
            anchorLocation: M.CENTER
        }),

        anchorLocation: M.TOP
    }),

    content: M.ScrollView.design({
        childViews: 'status response line periodCheck stopPeriodCheck checkOnce line disconnect',

        status: M.LabelView.design({
            contentBinding:{
                target: MySocketTest.NetworkStatusController,
                property: 'status'
            },
            value: '',
            cssClass: 'statusBar'
        }),
        response: M.LabelView.design({
            contentBinding:{
                target: MySocketTest.NetworkStatusController,
                property: 'responseTime'
            },
            value: '',
            cssClass: 'responseTime'
        }),

        line: M.ContainerView.design({
            cssClass: 'clearFloat distance'
        }),

        periodCheck: M.ButtonView.design({
            value: 'check periodical',
            icon: 'refresh',
            events: {
                tap: {
                    target: MySocketTest.NetworkStatusController,
                    action: 'periodCheck'
                }
            }
//            cssClass: 'clearFloat'
        }),
        stopPeriodCheck: M.ButtonView.design({
            value: 'stop checking',
            icon: 'minus',
            events: {
                tap: {
                    target: MySocketTest.NetworkStatusController,
                    action: 'stopPeriodCheck'
                }
            }
//            cssClass: 'loginBtn'
        }),

        checkOnce: M.ButtonView.design({
            value: 'check status once',
            icon: 'forward',
            events: {
                tap: {
                    target: MySocketTest.NetworkStatusController,
                    action: 'checkOnce'
                }
            }
//            cssClass: 'loginBtn'
        }),

        disconnect: M.ButtonView.design({
            icon: 'delete',
            value: 'disconnect',
            events: {
                tap: {
                    target: MySocketTest.NetworkStatusController,
                    action: 'disconnect'
                }
            }
//            cssClass: 'disconnectBtn'
        })

    })

});


// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// View: SocketRequestView
// ==========================================================================

MySocketTest.SocketRequestTemplateList = M.ListItemView.design({

    childViews: 'name',

    events: {
        tap: {
            target: MySocketTest.SocketRequestController,
            action:'socketRequestSelected'
        }
    },

    name: M.LabelView.design({
        valuePattern: '<%= name %>'
    })
});

// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest
// View: SocketRequestView
// ==========================================================================

MySocketTest.UtilitiesSocketRequestView = M.PageView.design({


    events: {
        pageshow:{
            target: MySocketTest.SocketRequestController,
            action: 'init'
        }},

    childViews: 'header content',

    header: M.ToolbarView.design({
        childViews: 'backButton title',

        backButton: M.ButtonView.design({
            value: 'Back',
            icon: 'arrow-l',
            anchorLocation: M.LEFT

//            events: {
//                tap:{
//                    target: MySocketTest.NetworkStatusController,
//                    action: 'here'
//                }
//            }
        }),

        title: M.LabelView.design({
            value: 'M.SocketRequest',
            anchorLocation: M.CENTER
        }),

        anchorLocation: M.TOP
    }),

    content: M.ScrollView.design({
        childViews: 'list',
        list: M.ListView.design({
            listItemTemplateView: MySocketTest.SocketRequestTemplateList,
            contentBinding:{
                target: MySocketTest.SocketRequestController,
                property: 'socketrequestList'
            }
        })
    })

});


// ==========================================================================
// The M-Project - Mobile HTML5 Application Framework
// Generated with: Espresso 
//
// Project: MySocketTest 
// ==========================================================================

var MySocketTest  = MySocketTest || {};

MySocketTest.app = M.Application.design({

    /* Define the entry/start page of your app. This property must be provided! */
    entryPage : 'socketRequestView',

    socketRequestView: MySocketTest.UtilitiesSocketRequestView,

    socketnetwork: MySocketTest.SocketRequestNetworkCheck,
    socketchat: MySocketTest.SocketRequestChatSample

});