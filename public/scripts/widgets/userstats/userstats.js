Backbone.widget({
    template: false,

    model: {},


    events: {

    },

    loaded: function () {
        this.ajaxRequest({
            url: 'webservices/user.json',
            renderCallback: function(data){
                this.model = data;
                this.render(this.model);

            }
        })
    },

    render: function () {
        this.renderTemplate({

            template: 'userstats',
            data: this.model,
            renderCallback: function () {

            }
        })
    }




}, ['map']);