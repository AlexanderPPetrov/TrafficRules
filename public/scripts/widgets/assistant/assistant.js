Backbone.widget({

    model: {},
    events: {},
    counter:0,
    tour:false,

    listen: {
        'SEND_MATRIX_DATA': 'setBotData',
        'ADD_BOT': 'addBot',
        'START_ASSISTANT': 'startAssistant',
        'PLACE_ASSISTANT': 'placeAssistant',
        'MOVE_TO_NEXT_POINT': 'moveToNextSpecialPoint'
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
            columns: 12,
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

        var invertedOffsetX = Math.ceil(-this.gridSize * 0.5 + 2);
        var offsetY = Math.ceil(this.gridSize - 4);
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
        this.findPath(this.mapObjects.endPoints);
        var orientation = this.defineOrientation(this.path[0], this.path[1]);
        orientation = orientation.slice(0,1);
        this.bot.animateSprite('play', orientation)
    },

    startAssistant: function (data) {
        if(data.tour){
            this.tour = data.tour;
            this.tourPoints = _.cloneDeep(this.mapObjects.specialPoints);
            this.findPath(this.tourPoints)
        }
        this.moveBot();
        this.highlightRoad();
    },

    removeBot: function () {
        if (this.bot) {
            this.bot.remove()
        }
    },

    findPath: function (goals) {
        console.log(goals)
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
        _.each(goals, function (goal) {
            var path = PathFinder.AStarSolver(nodes[this.model.data.y][this.model.data.x], nodes[goal.y][goal.x]);
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
        this.specialPoint = specialPoint;
        if(specialPoint && !this.tour){

            this.displaySpecialPoint(specialPoint);
            return;
        }
        this.moveToPosition(this.path[this.counter-1], this.path[this.counter], this.path[this.counter+1], function () {

            var orientation = context.defineOrientation(context.path[context.counter], context.path[context.counter + 1]);
            orientation = orientation.slice(0,1);
            context.bot.animateSprite('play', orientation)

            if (context.counter == context.path.length - 1 ) {
                if(!context.tour){
                    context.bot.fadeOut(function () {
                        $(this).remove();
                    });
                }else{
                    console.log('display special point');
                    $('.edit-menu').find('.info-text-container').addClass('assistant-info');
                    if(context.tourPoints.length != 1){
                        //context.moveToNextSpecialPoint()
                    }else{
                        console.log('end')
                        //context.bot.remove();
                        specialPoint.end = true;
                    }

                    context.displaySpecialPoint(specialPoint);

                }


            }else{
                context.counter++;
                context.moveBot();
            }

        });
    },

    moveToNextSpecialPoint: function(){

        this.tourPoints = _.without(this.tourPoints, this.specialPoint);
        this.model.data.y = this.specialPoint.y;
        this.model.data.x = this.specialPoint.x;
        this.findPath(this.tourPoints);
        this.counter = 0;
        this.moveBot();
        this.highlightRoad();

    },

    displaySpecialPoint: function(specialPoint){
        this.bot.animateSprite('stop');
        this.fire('POINTS_INFO', specialPoint);

        this.bot.find('.point-name').html(specialPoint.label);


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

    moveToPosition: function (prevposition, position, nextposition, callback) {
        var duration = 500;
        var orientation = this.defineOrientation(position, nextposition);
        if(orientation == 'ES' || orientation == 'WN' || orientation == 'NE' || orientation == 'SW') {
            duration = 750;
        }
        if(prevposition){
            var $road = $('.road[x='+ prevposition.x +'][y=' + prevposition.y +']').find('.move-arrow').fadeOut(function(){
                $(this).remove()
            });
        }

        var t = position.y * this.gridSize;
        var l = position.x * this.gridSize;
        this.bot.animate({top: t + 'px', left: l + 'px'}, {
            easing: "linear",
            duration: duration,
            complete: function () {
                callback()
            }
        });
    },

    checkSpecialPoints: function (position) {
        var specialPoint = _.findWhere(this.tourPoints, {x: position.x, y: position.y});
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



        // $('.move-arrow').css({'border': Math.floor(this.gridSize * 0.08) + 'px dashed rgba(161, 255, 0, 0.7)'})

        $('.move-arrow').find('i').css({
            'font-size': Math.ceil(this.gridSize * 3.5) + '%',
            'padding-top': Math.ceil(this.gridSize * 0.24) + 'px',
        })


    }

}, ['animatesprite', 'pathfinding']);