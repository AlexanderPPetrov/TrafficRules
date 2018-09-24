Backbone.widget({

    model: [],

    selected: null,
    currentQuestion: 0,

    events: {
        'click #next-question': 'moveToNext',
        'click #exit-game': 'exitGame',
        'click #confirm-exit': 'confirmExit',

    },

    listen: {

    },


    loaded: function () {
        $(".meter > span").each(function() {
            $(this)
                .data("origWidth", $(this).width())
                .width(0)
                .animate({
                    width: $(this).data("origWidth")
                }, 1200);
        });
    },

    moveToNext: function () {
        console.log('move to next')
    },
    exitGame: function(){
        this.$el.find('#confirmExit').modal('show');
    },
    confirmExit: function(){
        this.$el.find('#confirmExit').modal('hide');
        $('#confirmExit').on('hidden.bs.modal', function (e) {
            Backbone.router.navigate('#exams', true);
        })
    }





}, []);