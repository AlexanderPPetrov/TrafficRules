Backbone.widget({

    model: {},


    events: {

    },
    listen: {
        'DISPLAY_INFO': 'displayInfoText'
    },

    loaded: function () {
        this.render();
    },

    render: function () {

    },

    displayInfoText: function (data) {
        this.$el.find('.info-container').html(data);
        console.log('[Info Container] Display info text: ', data)
    }


}, ['map']);