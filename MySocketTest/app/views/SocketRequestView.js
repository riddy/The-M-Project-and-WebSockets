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

