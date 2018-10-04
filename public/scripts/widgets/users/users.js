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
                _.each(this.model.users, function (user, index) {
                    user.index = index
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
            items:1,
            onInitialized: function(){
                $('.container-fluid').removeClass('loader');
            }
        })
    },

    selectUser: function (e) {
        this.$el.find('.active').removeClass('active');
        var $selected = $(e.currentTarget);
        $selected.addClass('active');
        var playerId = $selected.attr('id');
        var playerData = _.findWhere(this.model.users, {_id: playerId});
        this.setUser(playerData);
        this.goToItem($(e.currentTarget));
    },

    goToItem: function($el) {
        var n = $el.attr('index');
        console.log('goto: ', n);
        if(n){
            this.$el.find('.owl-carousel').trigger('to.owl.carousel', n);
        }
    },

    searchUser: function (e) {
        var $input = $(e.currentTarget);
        var searchString = $input.val();
        searchString = searchString.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        $input.val(searchString);

        var searchVal = searchString.replace(/ /g, '').toLowerCase();

        if (searchVal == '') {
            this.$el.find('.user').show();
        } else {
            this.$el.find('.user').hide();
        }
        var $matching = this.$el.find(".user[username*=" + searchVal + "]");
        $matching.show();
        this.goToItem($matching.first());
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


}, ['owlcarousel']);