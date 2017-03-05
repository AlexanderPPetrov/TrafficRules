Backbone.widget({
    template: false,

    events: {
        'click #start-game': 'startGame'

    },

    listen: {
        'START_MAP': 'startMap',
        'PLACE_PLAYER': 'startTestQuestions'
    },


    loaded: function () {

        this.playerData = localStorage.getItem("playerData");
        if(!this.playerData){
            Backbone.router.navigate('#', true);
            return;
        }else{
            this.playerData = JSON.parse(this.playerData)
        }

        this.ajaxRequest({
            url: 'webservices/testForAGivenStudent.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.model = response;

                var mapTest = _.findWhere(this.model.testSections, {id: 4});
                var answeredQuestionsLength = _.where(mapTest.questions, {isAnswered: true}).length;


                this.model.playerData = {
                    id:this.playerData.id,
                    playerName: this.playerData.firstName + ' ' + this.playerData.lastName,
                    imageUrl: this.playerData.imageUrl,
                    role: this.playerData.role,
                    welcomeMessage:" Тази игра има за цел да те запознае с пътната обстановка около СОУ 'Свети Софроний Врачански' и да провери знанията ти по безопасност на движението. Когато си готов натисни бутона 'Започни'.",
                    answeredQuestionsLength: answeredQuestionsLength
                };

                if (answeredQuestionsLength == 1) {
                    console.log('>>>>',response)
                    this.fire('START_GAME', response)
                } else {
                    this.render();
                }

            }
        });
    },

    render: function () {

        console.log(this.model.playerData)
        this.renderTemplate({
            template: 'welcome',
            data: this.model.playerData,
            renderCallback: function () {
                console.log('start')
                var context = this;
                this.$el.find('.welcome-text').text(this.model.playerData.welcomeMessage).typewriter({
                    'speed': 40, 'end': function () {
                        context.$el.find('.overlay').removeClass('disabled-content');
                        context.$el.find('.btn').fadeIn('fast')
                    }
                });
            }
        })
    },

    startMap: function(){
        this.fire('START_MAP_QUESTIONS', this.model);
    },

    startTestQuestions: function(){
        this.fire('START_TEST_QUESTIONS', this.model)
    },

    startGame: function () {
        this.$el.find('.overlay').fadeOut(function () {
            $(this).remove()
        });
        this.fire('START_GAME', this.model)
    }

}, ['map', 'typewriter']);