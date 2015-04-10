Backbone.widget({

    model: {},

    events: {
        // Map control
        'click #new-level': 'newLevel',
        'click #load-level': 'loadLevel',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    loaded: function () {


    },

    render: function () {

    },

    newLevel: function () {
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL',{rows: rows, cols: cols});
    },

    loadLevel: function(){

    },

    moveToNext: function(){
        this.fire('MOVE_TO_NEXT');
    }



}, ['map']);