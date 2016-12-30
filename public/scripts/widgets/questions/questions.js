Backbone.widget({
    template: false,
    mapObjects: {},
    answersIndexes: [],
    possibleAnswers:[],
    mapQuestions: [],
    counter: 0,
    events: {
        "click #confirm-answer": "confirmAnswer"
    },

    listen: {
        'START_MAP_QUESTIONS': 'startQuestions'
    },

    loaded: function () {

    },

    startQuestions: function (data) {
        console.log(data);
        this.mapObjects = data.mapObjects;
        this.mapQuestions = _.cloneDeep(data.mapObjects.specialPoints);
        this.shuffle(this.mapQuestions);
        this.render();
    },

    render: function () {
        this.renderTemplate({

            template: 'questions',
            data: this.model,
            renderCallback: function () {
                this.prepareQuestion()
                this.$el.find(".base-container").draggable();

            }
        })
    },

    prepareQuestion: function () {

        this.answersIndexes = [];
        this.answersIndexes.push(this.counter);

        this.getThreeAnswers();

        this.possibleAnswers = [];
        _.each(this.answersIndexes, function (answerIndex, index) {
            var answer = {
                id: 'answer-' + index,
                label: this.mapQuestions[answerIndex].label,
            };
            if(index == 0){
                answer.right = true;
            }
            this.possibleAnswers.push(answer);
        }, this);

        this.shuffle(this.possibleAnswers);
        this.possibleAnswers.push({id: 'answer-3', label: 'Не съм сигурен'});
        this.renderQuestion(this.possibleAnswers);


    },

    highlightBuilding: function(specialPoint){

        this.fire('HIGHLIGHT_OBJECT', specialPoint)
    },


    shuffle: function (a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    },
    renderQuestion: function (answers) {

        this.$el.find('.possible-answers').empty();
        this.renderTemplate({

            template: 'answer',
            data: {answers: answers},
            el: '.possible-answers',
            append:true,
            renderCallback: function () {
                var context = this;
                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
                context.highlightBuilding(context.mapQuestions[context.counter]);
                context.counter++;
                this.$el.find('.questions').animate({
                    opacity: 1,
                }, 500, function() {

                });

            }
        })

    },

    getThreeAnswers: function () {

        var number = this.getRandomNumber(0, this.mapQuestions.length - 1);

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

    confirmAnswer: function(){

        if(this.counter == this.mapQuestions.length){
            $('.fog').hide();
            return;
        }
        var selectedId = this.$el.find('.possible-answers').find('input:checked').attr('id');
        var selectedAnswer = _.findWhere(this.possibleAnswers, {id:selectedId});
        var right = false;
        if(selectedAnswer.right){
            right = true;
        }
        console.log('question is: ',_.findWhere(this.possibleAnswers, {right:true}),' given answer is ',selectedAnswer,' which is', right)
        var context = this;
        $('.questions').animate({
            opacity: 0,
        }, 500, function() {
            context.prepareQuestion()
        });

    }

}, ['map', 'typewriter', 'jqueryui']);