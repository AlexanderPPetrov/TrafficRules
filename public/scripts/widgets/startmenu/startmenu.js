Backbone.widget({

    model: {},
    template: false,
    columnCount: 3,



    events: {

        'click .user' : 'selectUser',


    },

    loaded: function () {
        this.loadUsers()
    },

    loadUsers: function(){
        this.ajaxRequest({
            url: 'webservices/users.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.model.users = response;
                this.render();
            }
        });
    },

    render: function(e){
        this.renderTemplate({

            template: 'users',
            data: this.model,
            renderCallback: function () {
               console.log('rendered')
            }
        })
    },

    selectUser: function(){

    }




}, []);