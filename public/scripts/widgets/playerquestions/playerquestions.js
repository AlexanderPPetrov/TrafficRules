Backbone.widget({
    template: false,
    mapObjects: {},
    currentQuestion: {},
    possibleAnswers:[],
    mapQuestions: [],
    model:{},
    counter: 0,
    events: {
        "click #confirm-answer": "confirmAnswer"
    },

    listen: {
        'LOAD_QUESTIONS': 'startPlayerQuestions'

    },

    loaded: function () {

    },

    startPlayerQuestions: function () {

        this.ajaxRequest({
            url: 'webservices/tests.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.model.questions = response;
                this.render();

            }
        });
    },


    render: function () {
        this.renderTemplate({
            template: 'questions',
            data: this.model,
            renderCallback: function () {
                this.$el.fadeIn()

                this.$el.find(".base-container").draggable();
                this.currentQuestion = this.model.questions[0].testSections[0].questions[0];
                this.showQuestion(this.currentQuestion);
            }
        })
    },

    showQuestion: function(question){
        this.renderTemplate({
            el:'.questions',
            template: 'question',
            data: question,
            renderCallback: function () {

                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
                $('.questions').animate({
                    opacity: 1,
                }, 500, function() {
                });
            }
        })
    },


    confirmAnswer: function(){
        this.$el.fadeOut();
        this.fire('ANSWER_GIVEN')
    }

}, ['map', 'typewriter', 'jqueryui']);