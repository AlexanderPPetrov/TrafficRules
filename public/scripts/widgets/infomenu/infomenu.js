Backbone.widget({
    template: false,
    dragEnabled:false,
    model: {},
    x:0,
    y:0,
    events: {
        "click #confirm-start": "enableDrag",
        "click #start-tour": "startTour",
        "click #start-school": "startSchool"


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
                this.$el.find(".base-container").draggable();

                this.fire('GET_MATRIX_DATA')
                var context = this;
                this.displayInfoText(' Здравей, Гоше. Аз съм твой приятел и ще ти давам полезна информация. Постави ме на една от началните позиции, отбелязани с:', function(){
                    console.log('end')
                    context.$el.find('.info-start-point').fadeIn()
                })
            }
        })
    },

    enableDrag: function(){
        this.$el.find('.assistant-container').addClass('hvr-ripple-out')
        this.$el.find('.hvr-ripple-out').removeClass('ripple-active')
        this.$el.find('.hvr-ripple-out').addClass('ripple-active');
        if(this.dragEnabled){
            return;
        }
        this.dragEnabled = true;
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
                        $(this).closest('.road').find('.map-object').append('<img class="place-on-map grid-image" src="assets/img/tiles/map/place_bot.png"/>')
                    },
                    out: function( event, ui ) {
                        $(this).closest('.road').find('.map-object').find('.place-on-map').remove()
                    },
                    drop: function (event, ui) {

                        $('.hvr-ripple-out').removeClass('hvr-ripple-out');
                        context.$el.find('.info-start-point').hide()
                        context.x = parseInt($(this).closest('.road').attr('x'));
                        context.y = parseInt($(this).closest('.road').attr('y'));

                        context.fire('PLACE_ASSISTANT', {x: context.x, y: context.y});
                        context.displayInfoText(' Дали да не направим обиколка на забележителностите в района или да отидем към училище', function(){
                            context.$el.find('.info-chose').fadeIn();
                        });;


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

    setMapData: function(data){

        this.startPoints = data.mapObjects.startPoints;

    },

    startTour: function(){
        this.fire('START_ASSISTANT', {tour: true});
        this.$el.find('.info-chose').hide();
    },

    startSchool: function(){
        this.fire('START_ASSISTANT', {tour: false});
        this.$el.find('.info-chose').hide();
    },

    displayInfoText: function(infoText, callback){
        this.$el.find('.info-text').text('');
        this.$el.find('.info-text').text(infoText).typewriter({'speed':1, 'end': function(){
            if(callback){
                callback()
            }
        }});
    }



}, ['map','typewriter', 'jqueryui']);