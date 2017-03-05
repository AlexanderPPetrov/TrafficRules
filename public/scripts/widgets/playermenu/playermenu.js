Backbone.widget({
    template: false,
    model: {},
    x:0,
    y:0,
    routes: [
        {x: 3, y: 0, steps: 12},
        {x: 13, y: 0, steps: 6},
        {x: 18, y: 2, steps: 9},
        {x: 18, y: 4, steps: 7},
        {x: 18, y: 10, steps: 10},
        {x: 17, y: 18, steps: 14},
        {x: 10, y: 18, steps: 8},
        {x: 0, y: 11, steps: 13},
        {x: 0, y: 6, steps: 9}
    ],
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
        this.model = data;
        console.log(this.model)
        this.renderTemplate({

            template: 'playermenu',
            data: this.model.playerData,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
                if(this.model.answeredQuestionsLength < 1){
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
        this.fire('INIT_ASSISTANT', this.model.playerData)
    },

    playMap: function(){
        var context = this;
            context.$el.find('.start-assistant-container').fadeIn('fast');
            context.$el.find('.play-map').fadeIn('fast');
    },
    showResult: function(){

        // Check if position is finished
        for(var i = 0; i < this.startPoints.length; i++){
            if(this.model.testSections[i]){
                var answeredQuestionsLength = _.where(this.model.testSections[i].questions, {isAnswered: true}).length;
                if(this.routes[i].steps > answeredQuestionsLength && answeredQuestionsLength > 0 && this.model.testSections[i].id != 4 ){
                    console.log('not finished')

                    this.fire('POSITION_PLAYER', {x: this.startPoints[i].x, y: this.startPoints[i].y, answered: answeredQuestionsLength, questions: this.model.testSections[i].questions});

                }
            }


        }
        console.log(this.model)
        this.$el.find('.player-container').show();
        this.enableDrag();
        this.$el.find('.start-test-text').fadeIn()
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
                        context.$el.find('.start-points-container').hide()
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