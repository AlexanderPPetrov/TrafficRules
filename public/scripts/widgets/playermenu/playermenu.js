Backbone.widget({
    template: false,
    model: {},
    x:0,
    y:0,
    events: {
        // "click #confirm-start": "enableDrag",
        // "click #start-tour": "startTour",
        // "click #start-school": "startSchool"
        "click #start-assistant": "startAssistant"


    },

    listen: {
        'START_GAME': 'render',
        'SEND_MATRIX_DATA': 'setMapData'

    },

    loaded: function () {

    },


    render: function(data){
        this.model = data.playerData;
        console.log(this.model)
        this.renderTemplate({

            template: 'playermenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
                if(this.model.answeredQuestionsLength < 6){
                    this.playMap();
                }else{
                    this.showResult();
                }
            }
        })
    },


    setMapData: function(data){

        this.startPoints = data.mapObjects.startPoints;

    },



    displayInfoText: function(infoText, callback){
        this.$el.find('.info-text').text('');
        this.$el.find('.info-text').text(infoText).typewriter({'speed':40, 'end': function(){
            if(callback){
                callback()
            }
        }});
    },

    startAssistant: function (){
        this.$el.find('.start-assistant-container').fadeOut('fast');
        this.$el.find('.info-text').empty();
        this.fire('INIT_ASSISTANT', this.model)
    },

    playMap: function(){
        var context = this;
        this.displayInfoText(" Ще разгледаме района около СОУ 'Свети Софроний Врачански' с помощта на Робо. За целта натисни бутона 'Стартирай Робо'", function(){
            context.$el.find('.start-assistant-container').fadeIn('fast');
        })
    },
    showResult: function(){
        this.$el.find('.player-container').show();
        this.enableDrag();
        var context = this;
        this.displayInfoText(' Здравей, постави героят на една от началните позиции, отбелязани с:  ', function(){
            context.$el.find('.info-start-point').fadeIn()
        });;
    },

    enableDrag: function(){
        this.$el.find('.player-container').addClass('hvr-ripple-out');
        this.$el.find('.hvr-ripple-out').removeClass('ripple-active');
        this.$el.find('.hvr-ripple-out').addClass('ripple-active');

        var context = this;


        this.$el.find("#player-avatar").draggable({
            revert: "invalid",
            start: function () {
                console.log('start')
                console.log(context.startPoints)

                _.each(context.startPoints, function(startPoint){
                    $('.road[x='+ startPoint.x +'][y=' + startPoint.y +']').append("<div class='unlocked'></div>")
                })


                $(".unlocked").droppable({
                    accept: "#player-avatar",
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

                        context.fire('PLACE_PLAYER', {x: context.x, y: context.y});
                        context.$el.find('.player-container').hide();
                        context.displayInfoText(' Трябва да стигнеш до входа на училището отбелязан с:  ', function(){
                            context.$el.find('.info-chose').fadeIn();
                        });;


                        $('#player-avatar').attr('style', 'position:relative');

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



}, ['map','typewriter', 'jqueryui']);