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

