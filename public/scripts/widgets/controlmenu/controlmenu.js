Backbone.widget({

    model: {},

    events: {
        // Map control
        'change .fog-of-war input':'triggerFog',
        'click #new-level': 'newLevel',
        'click #load-level': 'loadLevel',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    loaded: function () {
        $(".base-container").draggable();

    },

    render: function () {

    },

    triggerFog: function(e){
        if($(e.currentTarget).is(':checked')){
            $('.fog').show();
        }else{
            $('.fog').hide();
        }
    },

    newLevel: function () {
        $('.fog-of-war input').prop('checked', false);
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL',{rows: rows, cols: cols});
    },

    loadLevel: function(){

    },

    moveToNext: function(){
        this.fire('MOVE_TO_NEXT');
    }



}, ['map','jqueryui']);