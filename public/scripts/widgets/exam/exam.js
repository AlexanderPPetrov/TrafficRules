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
        if(!localStorage.getItem('exams')){
            this.loadExams();
        }else{
            this.model.exams = JSON.parse(localStorage.getItem('exams'));
            this.model.currentExamIndex = parseInt(localStorage.getItem("currentExamIndex")) + 1;
            if(this.model.currentExamIndex > this.model.exams.length - 1){
                this.model.currentExamIndex = 0;
            }
            localStorage.setItem("currentExamIndex", this.model.currentExamIndex)

            this.loadSelectedExam();
        }
    },
    loadExams: function (){

        this.ajaxRequest({
            url: 'exams',
            type: "GET",
            success: function (response) {

                this.model.exams = _.sortBy(response, function(exam) {
                    return exam.variant;
                });

                for(var i = 0; i < this.model.exams.length; i++) {
                    this.model.exams[i].index = i;
                }
                localStorage.setItem("exams", JSON.stringify(this.model.exams));
                localStorage.setItem("currentExamIndex", 0);
                this.model.currentExamIndex = 0;
                this.loadSelectedExam();
            }
        });
    },
    readUserData: function () {
        this.model.userData = {
            avatar: "https://upload.wikimedia.org/wikipedia/commons/e/e8/CandymyloveYasu.png",
            group: "4а",
            imageUrl: "https://res.cloudinary.com/mateassets/image/upload/v1534874788/game/avatar.png",
            index: 2,
            name: "Антония Динкова Паничерска",
            searchString: "антониядинковапаничерска",
            __v: 0,
            _id: "5bbaf0f6cc28f80013e97d42",
        };

        // if (_.size(Backbone.session)) {
        //     this.model.userData = Backbone.session;
        // } else {
        //     this.model.userData = JSON.parse(localStorage.getItem('playerData'))
        // }

    },

    loadSelectedExam: function () {
        var examId = this.model.exams[this.model.currentExamIndex]._id;

        this.loadExam(examId)
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
        var view = this;
        setTimeout(function(){
            view.submitAnswer()
        }, 1000)
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
            $('body').addClass('loader');
            Backbone.router.navigate('#result/' + context.model.resultId, true);
        }, 300);
    }


}, []);