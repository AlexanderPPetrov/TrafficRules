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
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("playerData", JSON.stringify(data.playerData));
        } else {
            Backbone.session = data.playerData;
        }

    },

    startGame: function(){
        Backbone.router.navigate('#game', true);
    },






}, []);