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