Backbone.widget({
    template: false,

    events: {
        'click #start-game': 'startGame'

    },

    listen: {},


    loaded: function () {

        this.ajaxRequest({
            url: 'webservices/playerData1.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.model = response;
                if (this.model.playerData.mapVisited) {
                    this.fire('START_GAME', response)
                } else {
                    this.render();
                }

            }
        });
    },

    render: function () {

        console.log(this.model.playerData)
        this.renderTemplate({
            template: 'welcome',
            data: this.model.playerData,
            renderCallback: function () {
                console.log('start')
                var context = this;
                this.$el.find('.welcome-text').text(this.model.welcomeMessage).typewriter({
                    'speed': 2, 'end': function () {
                        context.$el.find('.overlay').removeClass('disabled-content');
                        context.$el.find('.btn').fadeIn('fast')
                    }
                });
            }
        })
    },


    startGame: function () {
        this.$el.find('.overlay').fadeOut(function () {
            $(this).remove()
        })
        this.fire('START_GAME', this.model)
    }

}, ['map', 'typewriter']);