Backbone.widget({

    model: {},

    events: {

        'click .play-btn': 'startGame'

    },

    listen: {
        'SHOW_TEST_RESULT': 'selectUser'
    },

    loaded: function () {

    },


    render: function(e){

    },

    selectUser: function(data){
        this.model = data.playerData;
        Backbone.session = data.playerData;
    },

    startGame: function(){
        Backbone.router.navigate('#game', true);
    }




}, []);