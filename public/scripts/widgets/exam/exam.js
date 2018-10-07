Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,

    events: {
        'click .map-object': 'displayInfoText',
        'click #submit-answer': 'submitAnswer',
        'click .answer-container': 'selectAnswer',
        'click #see-result': 'goToResult',

    },

    listen: {
        'DISPLAY_NEXT_QUESTION': 'displayNextQuestion'
    },


    loaded: function () {
        this.readUserData();
        this.loadSelectedExam();
    },

    readUserData: function () {

        if (_.size(Backbone.session)) {
            this.model.userData = Backbone.session;
        } else {
            this.model.userData = JSON.parse(localStorage.getItem('playerData'))
        }

    },

    loadSelectedExam: function () {
        this.model.examId = window.location.href.split('#gameplay/')[1];
        this.loadExam(this.model.examId)
    },

    loadExam: function (examId) {

        this.ajaxRequest({
            url: 'exams/' + examId,

            type: "GET",
            success: function (response) {
                this.model.exam = response;
                if (this.model.exam.map) {
                    this.fire('LOAD_EXAM_MAP', JSON.parse(this.model.exam.map))
                }
                this.startResult(examId, this.model.userData._id)
            }
        });
    },

    startResult: function(examId, studentId) {

        var postData = JSON.stringify({
            examId: examId,
            studentId: studentId
        });

        this.ajaxRequest({
            url: 'results',
            type: "POST",
            contentType: 'application/json',
            dataType: "json",
            data: postData,
            success: function (response) {
                this.model.resultId = response._id;
            }
        });
    },

    displayNextQuestion: function () {
        this.model.question = this.model.exam.questions[this.currentQuestion];
        this.model.questionId = this.model.question._id;
        this.renderQuestion();
        this.currentQuestion++;
        var context = this;
        setTimeout(function(){
            context.$el.find('#examModal').modal('show');
        }, 500);
    },

    renderQuestion: function () {

        this.clearEmptyAnswers();
        this.$el.find('.question-category').text(this.model.question.category);
        this.$el.find('.question-container').empty();
        this.renderTemplate({
            el: '.question-container',
            template: 'question',
            data: this.model.question,
            renderCallback: function () {
                var $questionImage = this.$el.find('.question-image'),
                    $questionImageContainer = $questionImage.closest('.question-wrapper');

                if (this.model.question.imageUrl) {
                    $questionImage.attr('src', this.model.question.imageUrl);
                    $questionImageContainer.removeClass('d-none');
                } else {
                    $questionImageContainer.addClass('d-none');
                }
                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
            }
        })

    },

    clearEmptyAnswers: function(){
        this.model.question.answers = _.filter(this.model.question.answers, function(answer){
            return answer.text !== ''
        });
    },

    selectAnswer: function (e) {
        var $selectedAnswer = $(e.currentTarget);
        this.model.answerId = $selectedAnswer.attr('id');
        this.$el.find('.selected').removeClass('selected');
        $selectedAnswer.addClass('selected');
        this.$el.find('#submit-answer').removeAttr('disabled');

    },

    checkAnswer: function() {
        this.$el.find('#submit-answer').attr('disabled', true);
        this.$el.find('.answer-container').addClass('locked');
        var time = 250;
        if(this.model.question.correctAnswer == this.model.answerId){
            this.$el.find('.selected').removeClass('selected').addClass('correct');
        }else{
            this.$el.find('.selected').removeClass('selected').addClass('wrong');
            this.$el.find('.answer-container[id="' + this.model.question.correctAnswer + '"]').addClass('correct');
            time = 2000;
        }
        var context = this;
        setTimeout(function(){
            context.postAnswer();
        }, time)
    },

    postAnswer: function() {
        this.calculateProgress();

        var postData = JSON.stringify({
            answerId: this.model.answerId,
            questionId: this.model.questionId,
            resultId: this.model.resultId
        });
        this.fire('ENABLE_NEXT_QUESTION_BUTTON');

        this.ajaxRequest({
            url: 'results/answer',
            type: "POST",
            contentType: 'application/json',
            dataType: "json",
            data: postData,
            success: function () {
                this.$el.find('#examModal').modal('hide');
                this.$el.find('#submit-answer').attr('disabled', true);
                if(this.currentQuestion == this.model.exam.questions.length){
                    this.finishResult(this.model.resultId);
                }
            }
        });
    },

    submitAnswer: function () {

        this.checkAnswer();



    },

    calculateProgress: function(){
        var percentage = (this.currentQuestion / this.model.exam.questions.length) * 100;
        this.fire('FILL_BAR', percentage)
    },

    finishResult: function(resultId){
        var postData = JSON.stringify({
            resultId: resultId
        });

        this.ajaxRequest({
            url: 'results/finish',
            type: "POST",
            contentType: 'application/json',
            dataType: "json",
            data: postData,
            success: function () {
                this.$el.find('#successEnd').modal('show');
            }
        })

    },
    goToResult: function () {
        this.$el.find('#successEnd').modal('hide');
        var context = this;
        setTimeout(function(){
            Backbone.router.navigate('#result/' + context.model.resultId, true);
        }, 300);
    }


}, []);