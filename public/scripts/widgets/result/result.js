Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,
    template: false,
    events: {
        'click .map-object': 'displayInfoText',
        'click #submit-answer': 'submitAnswer',
        'click .answer-container': 'selectAnswer',

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
                this.render(result)
            }
        });
    },



    render: function (result) {

        console.log(result)
        this.renderTemplate({
            template: 'result',
            data: {
                result: result
            },
            renderCallback: function () {
                $('.results-container').removeClass('loader')
            }
        })

    }



}, []);