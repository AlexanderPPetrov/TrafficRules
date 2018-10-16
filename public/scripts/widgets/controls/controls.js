Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,
    buttonAllowed: true,
    events: {
        'click #next-question': 'moveToNext',
        'click #exit-game': 'exitGame',
        'click #confirm-exit': 'confirmExit',
        'click .sound-container': 'toggleSound',

    },

    listen: {
        'FILL_BAR': 'fillBar',
        'ENABLE_NEXT_QUESTION_BUTTON': 'enableButton'
    },


    loaded: function () {
        $(".meter > span").each(function () {
            $(this)
                .data("origWidth", $(this).width())
                .width(0)
                .animate({
                    width: $(this).data("origWidth")
                }, 1200);
        });
    },

    enableButton: function(){
        this.buttonAllowed = true;
    },

    toggleSound: function (e) {
        $(e.currentTarget).toggleClass('active');
        this.fire('TOGGLE_SOUND')
    },

    fillBar: function (percentage) {
        this.$el.find('.progress-bar').css({width: percentage + '%'});
    },
    moveToNext: function () {
        if(!this.buttonAllowed){
            return;
        }
        $('.move-arrow').trigger('click');
        this.buttonAllowed = false;
    },
    exitGame: function () {
        this.$el.find('#confirmExit').modal('show');
    },
    confirmExit: function () {
        this.$el.find('#confirmExit').modal('hide');
        $('#confirmExit').on('hidden.bs.modal', function (e) {
            $('body').addClass('loader');
            Backbone.router.navigate('#exams', true);
        })
    }


}, []);