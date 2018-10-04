Backbone.widget({

    model: {},

    events: {
        'click .exam-container': 'selectExam',
        'click #start-game': 'startGame',
        'click #start-menu': 'goBack'

    },

    loaded: function () {
        this.loadExams()
    },

    loadExams: function(){
        this.ajaxRequest({
            url: 'exams',
            type: "GET",
            success: function (response) {
                this.model.exams = _.sortBy(response, function(exam) {
                    return exam.variant;
                });
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
                this.initCarousel();
            }
        })
    },

    initCarousel: function () {
        this.$el.find('.owl-carousel').owlCarousel({
            stagePadding: 50,
            loop:true,
            margin:10,
            nav:false,
            dots: false,
            items:2,
        })
    },

    selectExam: function(e){
        var $selectedExam = $(e.currentTarget);
        this.model.examId = $selectedExam.attr('id');
        this.$el.find('.exam-container').removeClass('active');
        $selectedExam.addClass('active');
        this.$el.find('#start-game').removeAttr('disabled');

    },
    goBack: function(){
        window.location.href = window.location.href.split('#')[0]
    },
    startGame: function(){
        var context = this;
        setTimeout(function(){
            Backbone.router.navigate('#gameplay/' + context.model.examId, true);
        }, 300);
    }


}, ['owlcarousel']);