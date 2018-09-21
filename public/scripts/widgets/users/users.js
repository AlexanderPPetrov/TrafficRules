Backbone.widget({

    model: {},

    events: {
        'click .user': 'selectUser',
        'click #start-game': 'startGame',
        'input #search-user': 'searchUser'
    },

    loaded: function () {
        this.loadUsers()
    },

    loadUsers: function () {
        this.ajaxRequest({
            url: 'students',
            type: "GET",
            success: function (response) {
                this.model.users = response;
                _.each(this.model.users, function (user) {
                    user.searchString = user.name.replace(/ /g, '').toLowerCase();
                    if (user.imageUrl == undefined || user.imageUrl == '') {
                        user.imageUrl = this.assetsURL + 'game/avatar.png'
                    }
                }, this);

                this.render();
            }
        });
    },

    render: function (e) {
        this.renderTemplate({
            el: this.$el.find('.users'),
            template: 'users',
            data: this.model,
            renderCallback: function () {
                this.$el.find('.user').first().trigger('click');
                this.$el.find('.base-container').removeClass('loader');
            }
        })
    },

    selectUser: function (e) {
        this.$el.find('.active').removeClass('active');
        var $selected = $(e.currentTarget);
        $selected.addClass('active');
        var playerId = $selected.attr('id');
        var playerData = _.findWhere(this.model.users, {_id: playerId});
        this.setUser(playerData)
    },

    searchUser: function (e) {
        var searchVal = $(e.currentTarget).val().replace(/ /g, '').toLowerCase();
        if (searchVal == '') {
            this.$el.find('.user').show();
        } else {
            this.$el.find('.user').hide();
        }
        this.$el.find(".user[username*=" + searchVal + "]").show();
    },
    startGame: function (e) {
        Backbone.router.navigate('#exams', true);
    },
    setUser: function (data) {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("playerData", JSON.stringify(data));
        }

        Backbone.session = data;

    }


}, []);