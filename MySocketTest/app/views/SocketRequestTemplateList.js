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
