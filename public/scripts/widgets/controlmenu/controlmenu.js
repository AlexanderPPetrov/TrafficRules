Backbone.widget({

    model: {},

    events: {
        'click #new-level': 'newLevel'
    },

    loaded: function () {


    },

    render: function () {

    },

    newLevel: function () {
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL',{rows: rows, cols: cols});
    }




}, ['map']);