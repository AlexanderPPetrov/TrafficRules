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
            }
        })
    },

    prepareQuestion: function () {

        this.answersIndexes = [];
        var randomIndex = this.getRandomNumber(0, this.mapQuestions.length - 1);
        this.answersIndexes.push(this.counter);
        this.getThreeAnswers();

        var question = this.mapQuestions[randomIndex];
        console.log(question, this.answersIndexes);
        this.possibleAnswers = [];
        _.each(this.answersIndexes, function (answerIndex, index) {
            console.log()
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

        this.renderTemplate({

            template: 'answer',
            data: {answers: answers},
            el: '.questions',
            append:true,
            renderCallback: function () {
                this.$el.find('.questions').find('input').first().prop('checked', true);
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

        var selectedId = this.$el.find('.questions').find('input:checked').attr('id');
        var selectedAnswer = _.findWhere(this.possibleAnswers, {id:selectedId});
        var right = false;
        if(selectedAnswer.right){
            right = true;
        }
        console.log('question is: ',_.findWhere(this.possibleAnswers, {right:true}),' given answer is ',selectedAnswer,' which is', right)
    }

}, ['map', 'typewriter', 'jqueryui']);