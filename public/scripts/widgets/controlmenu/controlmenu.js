Backbone.widget({

    model: {},
    template: false,

    events: {
        // Map control
        'change .toggle-fog input': 'toggleFog',
        'change .toggle-coordinates input': 'toggleCoordinates',
        'click #new-level': 'newLevel',
        'click #load-map': 'loadMap',
        'click #save-map': 'saveMap',
        'click #add-bot': 'addBot',
        'click #add-dummy-bots': 'addDummyBots',
        //Player controls
        'click #move-to-next': 'moveToNext'
    },

    loaded: function () {

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

                this.render();
            }
        });
    },

    render: function () {

        this.renderTemplate({
            template: 'controlmenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
            }
        })

    },

    toggleFog: function (e) {
        if ($(e.currentTarget).is(':checked')) {
            $('.fog').show();
        } else {
            $('.fog').hide();
        }
    },

    toggleCoordinates: function (e) {
        if ($(e.currentTarget).is(':checked')) {
            this.fire('SHOW_COORDINATES');
        } else {
            this.fire('HIDE_COORDINATES')
        }
    },

    newLevel: function (e) {
        $('.toggle-fog input').prop('checked', false);
        var rows = this.$el.find('#new-level-rows').val();
        var cols = this.$el.find('#new-level-cols').val();
        this.fire('NEW_LEVEL', {rows: rows, cols: cols});
        this.fire('REMOVE_DUMMY_BOTS');
    },

    saveMap: function () {
        var mapName = this.$el.find('#map-name').val();
        if (mapName != '') {
            this.fire('SAVE_MAP', mapName);
            this.$el.find('#map-name').val('');
        }
    },

    loadMap: function () {
        var examId = this.$el.find('#select-map').val();
        var exam = _.findWhere(this.model.exams, {_id: examId});
        this.fire('LOAD_EXAM', exam);
        this.fire('REMOVE_DUMMY_BOTS');
    },

    addBot: function () {
        this.fire('ADD_BOT')
    },

    addDummyBots: function () {

        this.fire('ADD_DUMMY_BOTS');

    },

    moveToNext: function () {
        this.fire('MOVE_TO_NEXT');
    }


}, ['map', 'jqueryui']);