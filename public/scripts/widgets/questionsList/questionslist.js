Backbone.widget({
    template: false,
    testIndex:0,
    mapMode:true,
    startPoints: [
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
    answersIndexes: [],
    possibleAnswers: [],
    questions: [],
    counter: 0,
    events: {
        "click #confirm-answer": "confirmAnswer"
    },

    listen: {
        'START_MAP_QUESTIONS': 'startQuestions',
        'PLACE_PLAYER': 'setPlayerPosition',
        'START_TEST_QUESTIONS': 'setQuestions',
        'SHOW_TEST_QUESTION': 'renderTestQuestion'

    },

    loaded: function () {

    },

    setPlayerPosition: function (data) {
        var startPoint = _.findWhere(this.startPoints, {x: data.x, y: data.y});
        this.testIndex = this.startPoints.indexOf(startPoint) + 1;
        this.questions = _.findWhere(this.model.testSections, {id: this.testIndex}).questions;
        this.render();
    },

    setQuestions: function (data) {
        this.model = data;
        this.mapMode = false;


    },

    renderTestQuestion: function(counter){

        console.log(counter)
        var currentQuestion = this.questions[counter]
        console.log(currentQuestion)
        this.showQuestion(currentQuestion)
    },

    showQuestion: function(question){
        this.renderTemplate({
            el:'.questions',
            template: 'question',
            data: question,
            renderCallback: function () {

                console.log('>>>>>', question)
                this.$el.fadeIn()
                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
                $('.questions').animate({
                    opacity: 1,
                }, 500, function() {
                });
            }
        })
    },

    startQuestions: function (data) {
        console.log(data);
        $('#bot-container').hide();
        $('.move-arrow').remove();
        this.questions = _.findWhere(data.testSections, {id: 4});
        //this.shuffle(this.questions);
        this.render(true);
    },

    render: function (playMap) {
        if(playMap == undefined){
            this.$el.hide();
        }
        this.renderTemplate({

            template: 'questions',
            data: this.model,
            renderCallback: function () {
                if(playMap){
                    this.renderQuestion(this.counter);
                }
                this.$el.find(".base-container").draggable();

            }
        })
    },

    //prepareQuestion: function () {
    //
    //    this.answersIndexes = [];
    //    this.answersIndexes.push(this.counter);
    //
    //    this.getThreeAnswers();
    //
    //    this.possibleAnswers = [];
    //    _.each(this.answersIndexes, function (answerIndex, index) {
    //        var answer = {
    //            id: 'answer-' + index,
    //            label: this.questions[answerIndex].label,
    //        };
    //        if(index == 0){
    //            answer.right = true;
    //        }
    //        this.possibleAnswers.push(answer);
    //    }, this);
    //
    //    this.shuffle(this.possibleAnswers);
    //    this.possibleAnswers.push({id: 'answer-3', label: 'Не съм сигурен'});
    //    this.renderQuestion(this.possibleAnswers);
    //
    //
    //},

    highlightBuilding: function (specialPoint) {

        this.fire('REQUEST_HIGHLIGHT_OBJECT', specialPoint)
    },


    //shuffle: function (a) {
    //    var j, x, i;
    //    for (i = a.length; i; i--) {
    //        j = Math.floor(Math.random() * i);
    //        x = a[i - 1];
    //        a[i - 1] = a[j];
    //        a[j] = x;
    //    }
    //},



    renderQuestion: function (counter) {

        this.$el.find('.possible-answers').empty();
        this.renderTemplate({

            template: 'answer',
            data: {answers: this.questions.questions[counter].answers},
            el: '.possible-answers',
            append: true,
            renderCallback: function () {
                var context = this;
                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
                console.log(counter)
                this.currentQuestion = context.questions.questions[counter];
                context.highlightBuilding(context.questions.questions[counter]);
                context.counter++;
                this.$el.find('.questions').animate({
                    opacity: 1,
                }, 500, function () {

                });

            }
        })

    },

    getThreeAnswers: function () {

        var number = this.getRandomNumber(0, this.questions.length - 1);

        if (this.answersIndexes.indexOf(number) == -1) {
            this.answersIndexes.push(number)
        }

        if (this.answersIndexes.length == 3) {
            return;
        } else {
            this.getThreeAnswers();
        }

    },

    getRandomNumber: function (bottom, top) {
        return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
    },

    confirmAnswer: function () {

        if(this.mapMode == false){
            this.$el.fadeOut();
            this.fire('ANSWER_GIVEN')
            return;
        }

        if (this.counter == this.questions.length) {
            $('.fog').hide();
            return;
        }
        var selectedId = this.$el.find('.possible-answers').find('input:checked').attr('id');
        var selectedAnswer = _.findWhere(this.possibleAnswers, {id: selectedId});

        console.log(this.currentQuestion, selectedId);

        var context = this;
        $('.questions').animate({
            opacity: 0,
        }, 500, function () {
            context.renderQuestion(context.counter);
        });

    }

}, ['map', 'typewriter', 'jqueryui']);