Backbone.widget({

    model: {},
    template: false,

    events: {
        // Map control
        'change .toggle-fog input': 'toggleFog',
        'change .toggle-coordinates input': 'toggleCoordinates',
        'click #new-level': 'newLevel',
        'click #new-blank': 'newBlankLevel',
        'click #load-map': 'loadMap',
        'click #save-map': 'saveMap',
        'click #add-bot': 'addBot',
        'click #add-dummy-bots': 'addDummyBots',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    listen: {
        'SEND_MATRIX_DATA': 'setMapData'

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

    setMapData: function(data){
        this.startPoints = data.mapObjects.startPoints;
        console.log(data)
    },

    render: function () {

        var context = this;
        this.renderTemplate({
            template: 'controlmenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
                this.$el.find("#assistant").draggable({
                    revert: "invalid",
                    start: function () {
                        console.log('start')
                        console.log(context.startPoints)

                        _.each(context.startPoints, function(startPoint){
                            $('.road[x='+ startPoint.x +'][y=' + startPoint.y +']').append("<div class='unlocked'></div>")
                        })


                        $(".unlocked").droppable({
                            accept: "#assistant",
                            classes: {
                                "ui-droppable-hover": "ui-state-hover",
                                "ui-droppable-active": "ui-state-default"
                            },
                            over: function( event, ui ) {
                                console.log('over')
                                $(this).closest('.road').find('.map-object').append('<img class="place-on-map grid-image" src="assets/img/tiles/map/place_bot.png"/>')
                            },
                            out: function( event, ui ) {
                                console.log('out')
                                $(this).closest('.road').find('.map-object').find('.place-on-map').remove()
                            },
                            drop: function (event, ui) {
                                var x = parseInt($(this).closest('.road').attr('x'));
                                var y = parseInt($(this).closest('.road').attr('y'));
                                context.fire('START_ASSISTANT', {x: x, y: y});
                                $('#assistant').attr('style', 'position:relative');

                                $(this).closest('.road').find('.map-object').find('.place-on-map').remove()

                            }
                        });


                    },
                    drag: function () {
                        // console.log('drag')
                    },
                    stop: function () {
                        console.log('stop')
                        $('.unlocked').remove();
                    }
                });
            }

        })


    },

    toggleFog: function (e) {
        if ($(e.currentTarget).is(':checked')) {
            $('.fog').show();
        } else {
            $('.fog').hide();
        }
    },

    toggleCoordinates: function (e) {
        if ($(e.currentTarget).is(':checked')) {
            this.fire('SHOW_COORDINATES');
        } else {
            this.fire('HIDE_COORDINATES')
        }
    },

    newLevel: function (e) {
        $('.toggle-fog input').prop('checked', false);
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL', {rows: rows, cols: cols});
        this.fire('REMOVE_DUMMY_BOTS');
    },

    newBlankLevel: function (e) {
        $('.toggle-fog input').prop('checked', false);
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_BLANK_LEVEL', {rows: rows, cols: cols});
        this.fire('REMOVE_DUMMY_BOTS');
    },

    saveMap: function () {
        var mapName = this.$el.find('#map-name').val();
        if (mapName != '') {
            this.fire('SAVE_MAP', mapName);
            this.$el.find('#map-name').val('');
        }
    },

    loadMap: function () {
        var mapToLoad = this.$el.find('#select-map').val();
        this.fire('LOAD_MAP', mapToLoad);
        this.fire('REMOVE_DUMMY_BOTS');
    },

    addBot: function () {
        this.fire('ADD_BOT')
    },

    addDummyBots: function () {

        this.fire('ADD_DUMMY_BOTS');

    },

    moveToNext: function () {
        this.fire('MOVE_TO_NEXT');
    }


}, ['map', 'jqueryui']);