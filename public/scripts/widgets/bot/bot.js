Backbone.widget({

    model: {},
    events: {},

    listen: {
        'SEND_MATRIX_DATA': 'setBotData',
        'ADD_BOT': 'addBot'
    },

    setBotData: function (mapData) {
        this.gridSize = mapData.gridSize;
        this.mapMatrix = mapData.mapMatrix;
        this.startBot();
        this.placeBot(1,1)
        console.log(mapData);
        this.moveBot([[1,2],[1,3],[2,3],[3,3]])
    },

    startBot: function () {
        this.$el.find('#bot-container').append('<div id="bot"></div>');
        this.bot = this.$el.find('#bot');
        this.bot.sprite({fps: 9, no_of_frames: 3})
            .active();
        //this.bot.spState(2);

    },
    placeBot: function (posX, posY) {

        this.bot.css({'top': posX * this.boxSize, 'left': posY * this.gridSize})
    },

    moveBot: function(path){
        for (var i = 0; i < path.length; i++) {
            this.moveToPosition(path[i]);
        }
    },

    addBot: function () {
        this.fire('GET_MATRIX_DATA')
    },

    flipBot: function () {

    },

    moveEast: function () {

    },

    moveWest: function () {

    },

    moveSouth: function () {

    },

    moveNorth: function () {

    },

    moveToPosition: function (position) {
        var t = position[0] * this.gridSize;
        var l = position[1] * this.gridSize;
        this.bot.animate({
            top: t + 'px',
            left: l + 'px'
        }, 1000);
    }

}, ['spritely']);