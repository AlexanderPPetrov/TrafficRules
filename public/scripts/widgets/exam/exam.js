Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,

    events: {
        'click .map-object': 'displayInfoText',
        'click #submit-answer': 'submitAnswer',
        'click .answer-container': 'selectAnswer',

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
        var question = this.model.exam.questions[this.currentQuestion];
        this.model.questionId = question._id;
        this.renderQuestion(question);
        this.currentQuestion++;
        var context = this;
        setTimeout(function(){
            context.$el.find('#examModal').modal('show');
        }, 500);
    },

    renderQuestion: function (question) {

        this.clearEmptyAnswers(question);
        this.$el.find('.question-category').text(question.category);
        this.$el.find('.question-container').empty();
        this.renderTemplate({
            el: '.question-container',
            template: 'question',
            data: question,
            renderCallback: function () {
                var $questionImage = this.$el.find('.question-image'),
                    $questionImageContainer = $questionImage.closest('.question-wrapper');

                if (question.imageUrl) {
                    $questionImage.attr('src', question.imageUrl);
                    $questionImageContainer.removeClass('d-none');
                } else {
                    $questionImageContainer.addClass('d-none');
                }
                this.$el.find('.possible-answers').find('input').first().prop('checked', true);
            }
        })

    },

    clearEmptyAnswers: function(question){
        question.answers = _.filter(question.answers, function(answer){
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
    submitAnswer: function () {

        this.calculateProgress();

        var postData = JSON.stringify({
            answerId: this.model.answerId,
            questionId: this.model.questionId,
            resultId: this.model.resultId
        });

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
                Backbone.router.navigate('#result/' + resultId, true);
            }
        })

    },



}, []);