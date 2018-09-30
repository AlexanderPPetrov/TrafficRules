Backbone.widget({

    model: {},

    loaded: function () {
        this.readUserData();
        this.render();
    },

    readUserData: function () {

        if (_.size(Backbone.session)) {
            this.model.userData = Backbone.session;
        } else {
            this.model.userData = JSON.parse(localStorage.getItem('playerData'))
        }

        if(this.model.userData.imageUrl == undefined || this.model.userData.imageUrl == ''){
            this.model.userData.imageUrl = this.assetsURL + 'game/avatar.png'
        }

    },

    render: function(e){
        this.renderTemplate({
            el: this.$el.find('.current-student-container'),
            template: 'student',
            data: this.model.userData
        })
    }



}, []);