Backbone.widget({
    template: false,
    model: {},
    events: {


    },

    listen: {
        'POINTS_INFO': 'displayInfoText',
        'SEND_MATRIX_DATA': 'setMapData'
    },

    loaded: function () {
    console.log('loaded')
        this.render();
    },


    render: function(){
        this.renderTemplate({

            template: 'infomenu',
            data: this.model,
            renderCallback: function () {
                this.fire('GET_MATRIX_DATA')
                var context = this;
                this.displayInfoText(' Здравей, Гоше. Аз съм твой приятел и ще ти давам полезна информация. Постави ме на една от началните позиции, отбелязани с:', function(){
                    console.log('end')
                    context.$el.find('.info-start-point').show()
                })
            }
        })
    },

    setMapData: function(data){

        this.startPoints = data.mapObjects.startPoints;
        var context = this;

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
    },

    displayInfoText: function(infoText, callback){
        this.$el.find('.info-text').text('');
        this.$el.find('.info-text').text(infoText).typewriter({'speed':50, 'end': function(){
            if(callback){
                callback()
            }
        }});
    }


}, ['map','typewriter', 'jqueryui']);