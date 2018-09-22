Backbone.widget({

    model: {},

    events: {
        'click .exam-container': 'selectExam'
    },

    loaded: function () {
        this.loadExams()
    },

    loadExams: function(){
        this.ajaxRequest({
            url: 'exams',
            type: "GET",
            success: function (response) {
                this.model.exams = response;
                console.log(this.model.exams)
                this.render();
            }
        });
    },

    render: function(e){
        this.renderTemplate({
            el: this.$el.find('.exams-list-container'),
            template: 'exams',
            data: this.model,
            renderCallback: function () {
                $('.exams-container').removeClass('loader')
            }
        })
    },

    selectExam: function(e){
        var $selectedExam = $(e.currentTarget),
            examId = $selectedExam.attr('id');
        $selectedExam.addClass('active');
        setTimeout(function(){
            Backbone.router.navigate('#gameplay/' + examId, true);

        }, 300);
    },



}, []);