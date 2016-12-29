Backbone.widget({

    model: {},
    events: {},
    counter:0,

    listen: {
        'SEND_MATRIX_DATA': 'setBotData',
        'ADD_BOT': 'addBot',
        'START_ASSISTANT': 'startAssistant',
        'PLACE_ASSISTANT': 'placeAssistant'
    },

    setBotData: function (mapData) {
        this.gridSize = mapData.gridSize;
        this.mapMatrix = mapData.mapMatrix;
        this.mapObjects = mapData.mapObjects;

        console.log(mapData);

    },

    startBot: function () {

        this.counter = 0;
        this.bot.animateSprite({
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

    },
    placeBot: function (x, y) {
        this.removeBot();
        this.$el.find('#bot-container').append('<div id="bot"><div class="bot-position"><span class="point-name"></span><div class="signs"></div></div></div>');
        this.bot = this.$el.find('#bot');
        var k = ((this.gridSize / 100) * this.bot.width()) / 100;

        var invertedOffsetX = Math.ceil(-this.gridSize * 0.24 - 2);
        var offsetY = Math.ceil(0.6 * this.gridSize);
        var matrix = 'matrix(2, 2, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
        this.bot.css('transform', matrix);
        this.bot.css({'top': x * this.gridSize, 'left': y * this.gridSize});


        var newWidth = Math.round(k * this.bot.width());
        var newHeight = Math.round(k * this.bot.height());
        this.bot.css({'width': newWidth + 'px', 'height': newHeight + 'px'});
        var backgroundWidth = (12 * this.bot.width()) + 'px';
        var backgroundHeight = this.bot.height() + 'px';
        this.bot.css({backgroundSize: backgroundWidth + ' ' + backgroundHeight});
        // console.log('background-size', this.bot.css('background-size'));
        // console.log('width', this.bot.width());
        // console.log('height', this.bot.height())
    },


    placeAssistant: function (data) {
        this.model.data = data;
        this.fire('GET_MATRIX_DATA');
        this.placeBot(this.model.data.y, this.model.data.x);
        this.startBot();
        this.findPath();
        var orientation = this.defineOrientation(this.path[0], this.path[1]);
        orientation = orientation.slice(0,1);
        this.bot.animateSprite('play', orientation)
    },

    startAssistant: function (data) {
        this.moveBot();
        this.highlightRoad();
    },

    removeBot: function () {
        if (this.bot) {
            this.bot.remove()
        }
    },

    findPath: function () {
        var PathFinder = new PathFinding();

        var nodes = [];
        for (var r = 0; r < this.mapMatrix.length; r++) {
            nodes[r] = [];
            for (var c = 0; c < this.mapMatrix[r].length; c++) {
                if (this.mapMatrix[r][c] == 0) {
                    // add nodes
                    nodes[r][c] = PathFinder.addNode(c, r);
                    // add verticies between nodes
                    // some more verticies, if we want diagonal movement

                    var diagonal = true;


                    if (nodes[r][c - 1] !== undefined) {
                        nodes[r][c].addVertex(nodes[r][c - 1]);
                        diagonal = false;
                    }
                    if (nodes[r - 1] !== undefined && nodes[r - 1][c] !== undefined) {
                        nodes[r][c].addVertex(nodes[r - 1][c]);
                        diagonal = false;
                    }

                    if (diagonal) {
                        if (nodes[r - 1] !== undefined && nodes[r - 1][c - 1] !== undefined) {
                            nodes[r][c].addVertex(nodes[r - 1][c - 1]);
                        }
                        if (nodes[r - 1] !== undefined && nodes[r - 1][c + 1] !== undefined) {
                            nodes[r][c].addVertex(nodes[r - 1][c + 1]);
                        }

                    }

                }

            }
        }

        var paths = [];
        var steps = [];
        _.each(this.mapObjects.endPoints, function (endPoint) {
            var path = PathFinder.AStarSolver(nodes[this.model.data.y][this.model.data.x], nodes[endPoint.y][endPoint.x]);
            paths.push(path);
            steps.push(path.length);
        }, this)
        var shortestWay = Math.min.apply(null, steps)

        this.path = paths[steps.indexOf(shortestWay)];
        console.log(this.path)


    },

    moveBot: function () {
        var context = this;
        var specialPoint = this.checkSpecialPoints(this.path[this.counter]);

        if(specialPoint){
            this.bot.animateSprite('stop');
            this.fire('POINTS_INFO', specialPoint.info);

            this.bot.find('.point-name').html(specialPoint.label);

            _.each(specialPoint.signs, function(sign){
                this.bot.find('.signs').append('<img class="sign-thumb" src="'+ sign + '"/>')
            }, this);

            return;
        }
        this.moveToPosition(this.path[this.counter], function () {

            var orientation = context.defineOrientation(context.path[context.counter], context.path[context.counter + 1]);
            orientation = orientation.slice(0,1);
            context.bot.animateSprite('play', orientation)

            if (context.counter == context.path.length - 1) {
                context.bot.fadeOut(function () {
                    $(this).remove();
                });
            }else{
                context.counter++;
                context.moveBot();
            }

        });
    },

    defineOrientation: function (previousPos, nextPos) {
        var orientation = 'E';
        if (nextPos) {
            if (previousPos.x == nextPos.x && previousPos.y > nextPos.y) {
                // console.log('NORTH | UP');
                orientation = 'N';
            }
            if (previousPos.x == nextPos.x && previousPos.y < nextPos.y) {
                // console.log('SOUTH | DOWN');
                orientation = 'S';
            }
            if (previousPos.x > nextPos.x && previousPos.y == nextPos.y) {
                // console.log('WEST | RIGHT');
                orientation = 'W';
            }
            if (previousPos.x < nextPos.x && previousPos.y == nextPos.y) {
                // console.log('EAST | LEFT');
                orientation = 'E';
            }

            if(previousPos.x > nextPos.x && previousPos.y > nextPos.y){
                orientation = 'NE';
            }

            if(previousPos.x < nextPos.x && previousPos.y > nextPos.y){
                orientation = 'WN';
            }

            if(previousPos.x < nextPos.x && previousPos.y < nextPos.y){
                orientation = 'SW';
            }

            if(previousPos.x > nextPos.x && previousPos.y < nextPos.y){
                orientation = 'ES';
            }
        }
        return orientation;
    },

    moveToPosition: function (position, callback) {
        var t = position.y * this.gridSize;
        var l = position.x * this.gridSize;
        this.bot.animate({top: t + 'px', left: l + 'px'}, {
            easing: "linear",
            duration: 1000,
            complete: function () {
                callback()
            }
        });
    },

    checkSpecialPoints: function (position) {
        var specialPoint = _.findWhere(this.mapObjects.specialPoints, {x: position.x, y: position.y});
        return specialPoint;
    },

    highlightRoad: function(){

        _.each(this.path, function (step, index) {
            var $road = $('.road[x='+ step.x +'][y=' + step.y +']');
            console.log(step)

            var orientation = this.defineOrientation(step, this.path[index+1]);

            var toAppend = '';
            if(orientation == 'E' || orientation == 'ES'){
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-arrow-circle-right"></i></div>';
            }
            if (orientation == 'W' || orientation == 'WN') {
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-arrow-circle-left"></i></div>';
            }
            if (orientation == 'N' || orientation == 'NE') {
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-arrow-circle-up"></i></div>';
            }
            if (orientation == 'S' || orientation == 'SW') {
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-arrow-circle-down"></i></div>';
            }
            if(index == this.path.length-1){
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-plus-circle"></i></div>';
            }

            $road.append(toAppend)
            if(orientation == 'ES' || orientation == 'WN' || orientation == 'NE' || orientation == 'SW') {
                $road.find('.move-arrow').find('i').css('transform','rotate(-45deg)')
            }
        }, this)



        $('.move-arrow').css({'border': Math.floor(this.gridSize * 0.125) + 'px dashed rgba(161, 255, 0, 0.7)'})

        $('.move-arrow').find('i').css({
            'font-size': Math.ceil(this.gridSize * 3.5) + '%',
            'padding-top': Math.ceil(this.gridSize * 0.13) + 'px',
        })


    }

}, ['animatesprite', 'pathfinding']);