Backbone.widget({

    model: {},
    template: false,

    events: {
        // Map control
        'change .toggle-fog input':'toggleFog',
        'change .toggle-coordinates input':'toggleCoordinates',
        'click #new-level': 'newLevel',
        'click #load-map': 'loadMap',
        'click #save-map': 'saveMap',
        'click #add-bot': 'addBot',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    loaded: function () {
        this.ajaxRequest({
            url: 'webservices/savedMaps.json',
            type: "GET",
            success: function (response) {
                this.model = response;
                this.render();
            }
        })
    },

    render: function () {

        this.renderTemplate({
            template: 'controlmenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
            }
        })

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
            this.fire('SHOW_COORDINATES');
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
        var mapToLoad = this.$el.find('#select-map').val();
        this.fire('LOAD_MAP', mapToLoad);
    },

    addBot: function(){
        this.fire('ADD_BOT')
    },

    moveToNext: function(){
        this.fire('MOVE_TO_NEXT');
    }



}, ['map','jqueryui']);