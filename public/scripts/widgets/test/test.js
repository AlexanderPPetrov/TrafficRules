Backbone.widget({

    model: {},

    events: {
        'click .user': 'selectUser',
        'input #search-user': 'searchUser'
    },

    listen: {
        'SHOW_TEST_RESULT': 'showResult'
    },

    loaded: function () {

    },

    renderPlayerData: function (data) {

        this.renderTemplate({
            el: this.$el.find('.player-data'),
            template: 'playerdata',
            data: data.playerData,
            renderCallback: function () {
            }
        })
    },

    showResult: function (data) {

        this.renderPlayerData(data);

        console.log(data)

        this.ajaxRequest({
            url: 'webservices/testForAGivenStudent.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.prepareData(response);
                this.renderStats();

            }
        });
    },

    prepareData: function(response){

        for (var i = 0; i < response.testSections.length; i++) {

            response.testSections[i].answeredCount = _.where(response.testSections[i].questions, {isAnswered: true}).length;
            response.testSections[i].correctCount = _.where(response.testSections[i].questions, {isCorrect: true}).length;
            console.log(response.testSections[i].answeredCount, response.testSections[i].correctCount)
            if(response.testSections[i].answeredCount == 0){
                response.testSections[i].percentage = 0;
            }else{
                response.testSections[i].percentage = (response.testSections[i].correctCount / response.testSections[i].answeredCount)* 100 ;
            }
            response.testSections[i].percentageColor = 'low-percentage';

            if(response.testSections[i].percentage > 40){
                response.testSections[i].percentageColor = 'average-percentage';
            }
            if(response.testSections[i].percentage > 60){
                response.testSections[i].percentageColor = 'high-percentage';
            }

            for (var j = 0; j < response.testSections[i].questions.length; j++) {
                var question = response.testSections[i].questions[j];

                question.correctAnswer = _.findWhere(question.answers, {id: question.correctAnswerId}).description
                if(question.isAnswered){
                    question.givenAnswer = _.findWhere(question.answers, {id: question.givenAnswerId}).description;

                }

                if(question.isCorrect){
                    question.isCorrectAnswer = 'correct-answer'
                }else{
                    question.isCorrectAnswer = 'wrong-answer'
                }

                if(question.isAnswered == false){
                    question.isCorrectAnswer = ''
                }

            }

        }

        this.model = response;

    },

    renderStats: function(){
        this.renderTemplate({
            el: this.$el.find('.player-stats'),
            template: 'playerstats',
            data: this.model,
            renderCallback: function () {
            }
        })
    }



}, []);