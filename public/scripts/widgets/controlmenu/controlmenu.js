Backbone.widget({

    model: {},

    events: {
        // Map control
        'change .toggle-fog input':'toggleFog',
        'change .toggle-coordinates input':'toggleCoordinates',
        'click #new-level': 'newLevel',
        'click #load-map': 'loadMap',
        'click #save-map': 'saveMap',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    loaded: function () {
        $(".base-container").draggable();
    },

    render: function () {

    },

    toggleFog: function(e){
        if($(e.currentTarget).is(':checked')){
            $('.fog').show();
        }else{
            $('.fog').hide();
        }
    },

    toggleCoordinates: function(e){
        if($(e.currentTarget).is(':checked')){
            this.fire('GET_COORDINATES');
        }else{
            this.fire('HIDE_COORDINATES')
        }
    },

    newLevel: function (e) {
        $('.toggle-fog input').prop('checked', false);
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL',{rows: rows, cols: cols});
    },

    saveMap: function(){
        var mapName = this.$el.find('#map-name').val();
        if(mapName != ''){
            this.fire('SAVE_MAP', mapName);
            this.$el.find('#map-name').val('');
        }
    },

    loadMap: function(){
        this.fire('LOAD_MAP');
    },



    moveToNext: function(){
        this.fire('MOVE_TO_NEXT');
    }



}, ['map','jqueryui']);