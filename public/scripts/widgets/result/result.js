Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,
    template: false,
    events: {
        'click #next-question': 'examsMenu',
    },

    listen: {

    },


    loaded: function () {
        this.loadResult();
    },

    loadResult: function () {
        this.model.resultId = window.location.href.split('#result/')[1];
        this.getResult(this.model.resultId)
    },

    getResult: function(resultId){
        this.ajaxRequest({
            url: 'results/' + resultId,
            type: "GET",
            success: function (result) {
                this.model.result = this.transformResultData(result);
                this.render()
            }
        });
    },

    transformResultData: function(result) {

        for(var i = 0; i < result.questions.length; i++) {
            var question = result.questions[i];
            question.index = i + 1;
            if(question.givenAnswer == question.correctAnswer){
                question.answerClass = 'success-label';
                question.indicatorClass = 'success-evaluation';
            }else{
                question.answerClass = 'error-label';
                question.indicatorClass = 'error-evaluation';
            }
            question.correctValue = _.findWhere(question.answers, {_id: question.correctAnswer}).text;
            question.givenValue = _.findWhere(question.answers, {_id: question.givenAnswer}).text;
        }

        result.percentage = '0.00';
        var score = result.score;
        if (score) {
            var scoreResult = score.split('/');
            scoreResult = (scoreResult[0] / scoreResult[1]) * 100;
            result.percentageClass = this.getPercentageLabel(scoreResult);
            result.percentage = parseFloat(scoreResult).toFixed(2);

        }

        return result;

    },

    getPercentageLabel: function(percentage){

        if(percentage > 66){
            return 'success-label';
        }
        if(percentage < 66 && percentage > 40) {
            return 'warning-label'
        }
        return 'error-label'

    },
    render: function () {

        this.renderTemplate({
            template: 'result',
            data: {
                result: this.model.result
            },
            renderCallback: function () {
                $('body').removeClass('loader')
            }
        })

    },
    examsMenu: function (){
        $('body').addClass('loader')
        Backbone.router.navigate('#', true);
    }



}, []);