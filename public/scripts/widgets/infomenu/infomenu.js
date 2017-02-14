Backbone.widget({
    template: false,
    dragEnabled:false,
    model: {},
    x:0,
    y:0,
    events: {
        "click #confirm-start": "enableDrag",
        "click #start-tour": "startTour",
        "click #start-school": "startSchool",
        "click #start-test": "startTest",
        "click #confirm-point": "confirmPoint"


    },

    listen: {
        'POINTS_INFO': 'displaySpecialPoint',
        'SEND_MATRIX_DATA': 'setMapData',
        'INIT_ASSISTANT':'render'
    },

    loaded: function () {

    },


    render: function(data){
        this.model = data;
        this.renderTemplate({

            template: 'infomenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();

                this.fire('GET_MATRIX_DATA')
                var context = this;
                this.displayInfoText(' Здравей, '+ context.model.playerName +'. Аз съм твой приятел и ще ти давам полезна информация. Постави ме на една от началните позиции, отбелязани с:', function(){
                    console.log('end')
                    context.$el.find('.info-start-point').fadeIn()
                })
            }
        })
    },

    displayEndMessage: function(){
        var context = this;
        this.displayInfoText(' Моята обиколка завърши, когато си готов натисни бутона "Започни", за да проверим дали си се ориентирал правилно на картата.', function(){
            console.log('end')
            context.$el.find('.start-test').fadeIn()
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
                        context.displayInfoText(' Ще направя обиколка на района около училището, за да те запозная с картата и забележителностите. Когато си готов ми кажи да започна. ', function(){
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

    startTest: function(){
        console.log(this.model)
        //this.fire('START_MAP_QUESTIONS', {'mapObjects':context.mapObjects})

    },

    displayInfoText: function(infoText, callback){
        this.$el.find('.info-text').text('');
        this.$el.find('.info-text').text(infoText).typewriter({'speed':10, 'end': function(){
            if(callback){
                callback()
            }
        }});
    },

    displaySpecialPoint: function(specialPoint){
        this.fire('HIGHLIGHT_OBJECT', specialPoint)
        var context = this;
        $('.info-text-container').css('visibility', 'visible')
        this.displayInfoText(specialPoint.info, function(){
            $('#confirm-point').show()
            context.$el.find('.info-signs').empty()
            _.each(specialPoint.signs, function(sign){
                context.$el.find('.info-signs').append('<img class="sign-thumb" src="'+ sign + '"/>')
            }, context);
            if(specialPoint.end){
                console.log('end')
                context.end = true;
            }

        })
        this.$el.find('.image-preview').attr('src', specialPoint.img);
        this.$el.find('.point-info').text(specialPoint.label);
        this.$el.find('.image-preview').show()


    },

    confirmPoint: function(){
        $('.fog').hide();
        if(this.end){
            this.displayEndMessage()
            return;
        }
        this.fire('MOVE_TO_NEXT_POINT');
        this.$el.find('.confirm-point').hide()
        $('.info-text-container').css('visibility', 'hidden')
    }



}, ['map','typewriter', 'jqueryui']);