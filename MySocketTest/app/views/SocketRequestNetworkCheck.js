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

