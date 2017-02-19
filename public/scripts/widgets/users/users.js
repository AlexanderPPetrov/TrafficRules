Backbone.widget({

    model: {},

    events: {
        'click .user' : 'selectUser',
        'input #search-user': 'searchUser'
    },

    loaded: function () {
        this.loadUsers()
    },

    loadUsers: function(){
        this.ajaxRequest({
            url: 'webservices/users.json',
            data: {},
            type: "GET",
            success: function (response) {
                this.model.users = response;
                _.each(this.model.users, function(user){
                    user.searchString = (user.firstName + user.lastName).toLowerCase();
                    if(user.imageUrl == undefined || user.imageUrl == ''){
                        user.imageUrl = '/assets/img/avatar.png'
                    }
                })
                this.render();
            }
        });
    },

    render: function(e){
        this.renderTemplate({
            el: this.$el.find('.users'),
            template: 'users',
            data: this.model,
            renderCallback: function () {
               this.$el.find('.user').first().trigger('click');
            }
        })
    },

    selectUser: function(e){
        this.$el.find('.active').removeClass('active');
        $(e.currentTarget).addClass('active');
        var playerId = parseInt($(e.currentTarget).attr('id'));
        var playerData = _.findWhere(this.model.users, {id:playerId})
        this.fire('SHOW_TEST_RESULT', { playerData: playerData})
    },

    searchUser: function(e){
        var searchVal = $(e.currentTarget).val().replace(/ /g,'').toLowerCase();
        if(searchVal == ''){
            this.$el.find('.user').show();
        }else{
            this.$el.find('.user').hide();
        }
        this.$el.find(".user[username*=" + searchVal + "]").show();
    }




}, []);