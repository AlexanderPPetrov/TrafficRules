Backbone.widget({

    model: {},
    events: {},
    loopStarted: false,

    listen: {
        'SEND_MATRIX_DATA': 'setMatrixData',
        'ADD_DUMMY_BOTS': 'addDummyBots',
        'REMOVE_DUMMY_BOTS': 'removeDummyBots'
    },


    loaded: function(){
        this.model.bots = [];
        this.model.available = [];
        window.addEventListener('focus', function() {
            clearInterval(this.loopInterval);
        },false);
    },

    setMatrixData: function (mapData) {
        this.model.gridSize = mapData.gridSize;
        this.model.mapMatrix = mapData.mapMatrix;
    },

    startBot: function (bot) {
        var $currentBot = this.$el.find('#' + bot.id);
        $currentBot.animateSprite({
            fps: 12,
            loop: true,
            autoplay: false,
            animations: {
                E: [0, 1, 2],
                N: [3, 4, 5],
                W: [6, 7, 8],
                S: [9, 10, 11]
            }
        })

        $currentBot.animateSprite('play', bot.direction);

    },

    removeDummyBots: function(){
        this.model.bots = [];
        this.model.available = [];
        this.$el.find('#dummy-bot-container').html('');
    },

    placeBots: function (bots) {

        _.each(bots, function(bot, index) {
            if(!bot.rendered){
                bot.id = 'Robo_' + this.zeroFill(index,3);
                this.$el.find('#dummy-bot-container').append('<div id="'+ bot.id +'" class="bot '+ bot.className +'"><div class="bot-position"><span class="bot-name">'+bot.id+'</span><br>x:<span class="bot-x">'+ bot.x +'</span><span style="margin-left:2px;">y:</span><span class="bot-y">'+ bot.y +'</span></div></div>');
                var $currentBot = this.$el.find('#' + bot.id);

                var k = ((this.model.gridSize / 100) * $currentBot.width()) / 100;

                var invertedOffsetX = Math.ceil(-this.model.gridSize*0.24 - 2);
                var offsetY = Math.ceil(0.6*this.model.gridSize);
                var matrix = 'matrix(1, 1, -2, 2, ' + offsetY + ',' + invertedOffsetX + ')';
                $currentBot.css('transform', matrix);
                $currentBot.css({'top': bot.y * this.model.gridSize, 'left': bot.x * this.model.gridSize});
                var newWidth = Math.round(k * $currentBot.width());
                var newHeight = Math.round(k * $currentBot.height());
                $currentBot.css({'width': newWidth + 'px', 'height': newHeight + 'px'});
                var backgroundWidth = (12 * $currentBot.width()) + 'px';
                var backgroundHeight = $currentBot.height() + 'px';
                $currentBot.css({ backgroundSize : backgroundWidth+' '+backgroundHeight });
                this.startBot(bot);
                bot.rendered = true;

            }

        }, this);
        this.$el.find('#dummy-bot-container').show();
        var context = this;
        clearInterval(this.loopInterval);
        this.loopInterval = setInterval(function () {
           context.animateBots();
        }, 1000);
    },

    getAvailablePositions: function (){
        var availablePositions = [];
        for (var i = 0; i < this.model.mapMatrix.length; i++) {
            for (var j = 0; j < this.model.mapMatrix[i].length; j++) {
                if(this.model.mapMatrix[i][j] == 0){
                    var available = {};
                    available.x = j;
                    available.y = i;
                    availablePositions.push(available);
                }
            }
        }
        return availablePositions;
    },

    addDummyBots: function () {
        this.fire('GET_MATRIX_DATA');
        this.removeDummyBots();

        this.model.available = this.getAvailablePositions();

        var bots = [];
        var botsCount = Math.floor(this.model.available.length*0.5);
        for (var i = 0; i < botsCount; i++) {
            var randomNumber = Math.floor((Math.random() * this.model.available.length - 1) + 1);

            var bot ={};
            bot.className = 'dummy-bot';

            bot.x = this.model.available[randomNumber].x;
            bot.y = this.model.available[randomNumber].y;
            bot.direction = 'E';
            var initialPosition= this.getNewPosition(bot, this.getAvailableDirections(bot));
            bot.direction = initialPosition.direction;
            bots.push(bot);


        }

        _.each(bots, function(bot){
            this.model.bots.push(bot);
        }, this);

        this.placeBots(this.model.bots)

    },



    moveToPosition: function (bot, position) {
        var t = position.y * this.model.gridSize;
        var l = position.x * this.model.gridSize;
        var $currentBot = this.$el.find('#' + bot.id);

        var context = this;
        context.setNewPosition(bot, position);
        $currentBot.animate({top: t + 'px', left: l + 'px'}, {
            easing: "linear",
            duration: 1000,
            complete: function () {
                var $currentBot = context.$el.find('#' + bot.id);
                $currentBot.find('.bot-x').html(bot.x);
                $currentBot.find('.bot-y').html(bot.y);
                $currentBot.animateSprite('play', bot.direction);
            }
        });

    },

    setNewPosition: function(bot, position){
        bot.x = position.x;
        bot.y = position.y;
        bot.direction = position.direction;
    },

    getAvailableDirections: function(bot){
        var availablePositions = [];
        if(this.model.mapMatrix[bot.y][bot.x + 1] !== undefined  && this.model.mapMatrix[bot.y][bot.x+1] == 0){
            var available = {}; available.x = bot.x + 1; available.y = bot.y; available.direction = 'E';
            availablePositions.push(available);
        }
        if(this.model.mapMatrix[bot.y + 1] && this.model.mapMatrix[bot.y + 1][bot.x] == 0){
            var available = {}; available.x = bot.x; available.y = bot.y + 1; available.direction = 'S';
            availablePositions.push(available);
        }
        if(this.model.mapMatrix[bot.y][bot.x-1] !== undefined && this.model.mapMatrix[bot.y][bot.x-1] == 0){
            var available = {}; available.x = bot.x -1; available.y = bot.y; available.direction = 'W';
            availablePositions.push(available);
        }
        if(this.model.mapMatrix[bot.y - 1] && this.model.mapMatrix[bot.y - 1][bot.x] == 0){
            var available = {}; available.x = bot.x; available.y = bot.y -1; available.direction = 'N';
            availablePositions.push(available);
        }
        return availablePositions;
    },

    getNewPosition: function(bot, availableDirections){
        var newPosition = {};
       
        switch (bot.direction) {
            case 'E':
                newPosition = _.findWhere(availableDirections, {'direction': 'S'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'E'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'N'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'W'});
                break;
            case 'S':
                newPosition = _.findWhere(availableDirections, {'direction': 'W'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'S'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'E'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'N'});
                break;
            case 'W':
                newPosition = _.findWhere(availableDirections, {'direction': 'N'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'W'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'S'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'E'});
                break;
            case 'N':
                newPosition = _.findWhere(availableDirections, {'direction': 'E'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'N'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'W'});
                if(!newPosition) newPosition = _.findWhere(availableDirections, {'direction': 'S'});
                break;
        }
        
        return newPosition;
    },

    animateBots: function() {
        _.each(this.model.bots, function(bot){
            var newPosition = this.getNewPosition(bot, this.getAvailableDirections(bot));
            this.moveToPosition(bot, newPosition);
        },this);
    }

}, ['animatesprite', 'pathfinding']);