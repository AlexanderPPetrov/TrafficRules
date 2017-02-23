Backbone.widget({

    model: {},
    events: {},
    counter: 0,
    tour: false,


    listen: {
        'SEND_MATRIX_DATA': 'setBotData',
        'ADD_BOT': 'addBot',
        'PLACE_PLAYER': 'placePlayer',
        'MOVE_PLAYER': 'movePlayer',
        'ANSWER_GIVEN': 'giveNextMove'
    },

    loaded: function () {

        console.log('player loaded')

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
            columns: 64,
            animations: {
                W: [0, 1, 2, 3, 4, 5, 6, 7], // right
                N: [8, 9, 10, 11, 12, 13, 14, 15], //right
                S: [16, 17, 18, 19, 20, 21, 22, 23], //right
                E: [24, 25, 26, 27, 28, 29, 30, 31], //right
                WN: [32, 33, 34, 35, 36, 37, 38, 39],
                NE: [40, 41, 42, 43, 44, 45, 46, 47],
                SW: [48, 49, 50, 51, 52, 53, 54, 55], // right
                ES: [56, 57, 58, 59, 60, 61, 62, 63]
            }
        });
    },

    getStopFrame: function (orientation) {

        var frames = {W: 0, N: 8, S: 16, E: 24, WN: 32, NE: 40, SW: 48, ES: 56}

        return frames[orientation]
    },

    placeBot: function (x, y) {
        this.removePlayer();
        this.$el.find('#player-container').append('<div id="player"><div class="bot-position"><span class="point-name"></span><div class="signs"></div></div></div>');
        this.bot = this.$el.find('#player');
        var k = ((this.gridSize / 100) * this.bot.width()) / 100;

        var invertedOffsetX = Math.ceil(-this.gridSize * 0.5 + 2);
        var offsetY = Math.ceil(this.gridSize - 4);
        offsetY = 7;
        invertedOffsetX = -42;
        var matrix = 'matrix(0.56, 0.56, -1, 1, ' + offsetY + ',' + invertedOffsetX + ')';
        this.bot.css('transform', matrix);
        this.bot.css({'top': x * this.gridSize, 'left': y * this.gridSize});

        //var newWidth = Math.round(k * this.bot.width());
        //var newHeight = Math.round(k * this.bot.height());
        //this.bot.css({'width': newWidth + 'px', 'height': newHeight + 'px'});
        //var backgroundWidth = (12 * this.bot.width()) + 'px';
        //var backgroundHeight = this.bot.height() + 'px';
        //this.bot.css({backgroundSize: backgroundWidth + ' ' + backgroundHeight});
        // console.log('background-size', this.bot.css('background-size'));
        // console.log('width', this.bot.width());
        // console.log('height', this.bot.height())
    },


    placePlayer: function (data) {
        console.log('asd')

        this.model.data = data;
        this.fire('GET_MATRIX_DATA');
        this.placeBot(this.model.data.y, this.model.data.x);
        this.startBot();
        this.findPath(this.mapObjects.endPoints);
        var orientation = this.defineOrientation(this.path[0], this.path[1]);

        this.bot.animateSprite('play', orientation);
        this.bot.animateSprite('stop');
        var stopFrame = this.getStopFrame(orientation);
        this.bot.animateSprite('frame', stopFrame);

        console.log(stopFrame)

        console.log(orientation)
        this.highlightRoad();
        this.hideEndPoints();
        //this.disableOtherPaths()
        console.log(this.path)
        this.giveNextMove()
    },

    startAssistant: function (data) {
        if (data.tour) {
            this.tour = data.tour;
            this.tourPoints = _.cloneDeep(this.mapObjects.specialPoints);
            this.findPath(this.tourPoints)
        }
        this.movePlayer();
        this.highlightRoad();
    },

    removePlayer: function () {
        if (this.bot) {
            this.bot.remove()
        }
    },

    giveNextMove: function () {
        if ((this.counter + 1) == this.path.length) return;
        var position = this.path[this.counter + 1];
        $('.move-player').removeClass('move-player');
        var $road = $('.road[x=' + position.x + '][y=' + position.y + ']');
        $road.addClass('move-player')
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

    movePlayer: function () {
        console.log('click')
        this.counter++;
        var context = this;
        //var specialPoint = this.checkSpecialPoints(this.path[this.counter]);
        //
        //if (specialPoint && !this.tour) {
        //
        //    this.displaySpecialPoint(specialPoint);
        //    return;
        //}
        context.bot.animateSprite('resume');

        this.moveToPosition(this.path[this.counter - 1], this.path[this.counter], this.path[this.counter + 1], function () {

            var orientation = context.defineOrientation(context.path[context.counter], context.path[context.counter + 1]);
            console.log(orientation)
            context.bot.animateSprite('play', orientation);
            context.bot.animateSprite('stop');
            var stopFrame = context.getStopFrame(orientation);
            context.bot.animateSprite('frame', stopFrame);

            if (context.counter < context.path.length - 1) {
                //if (!context.tour) {
                //    context.bot.fadeOut(function () {
                //        $(this).remove();
                //    });
                //} else {
                //    console.log('display special point')
                //    context.displaySpecialPoint(specialPoint);
                //    if (context.tourPoints.length != 1) {
                //        context.moveToNextSpecialPoint(specialPoint)
                //    } else {
                //        console.log('end')
                //        context.fire('START_MAP_QUESTIONS', {'mapObjects': context.mapObjects})
                //    }
                //}
                context.fire('SHOW_TEST_QUESTION', context.counter);

            } else {
                //context.counter++;
                //context.movePlayer();
            }

        });
    },

    moveToNextSpecialPoint: function (specialPoint) {
        this.tourPoints = _.without(this.tourPoints, specialPoint);
        this.model.data.y = specialPoint.y;
        this.model.data.x = specialPoint.x;
        this.findPath(this.tourPoints);
        this.counter = 0;
        this.movePlayer();
        this.highlightRoad();

    },

    displaySpecialPoint: function (specialPoint) {
        this.bot.animateSprite('stop');
        this.fire('POINTS_INFO', specialPoint.info);

        this.bot.find('.point-name').html(specialPoint.label);

        _.each(specialPoint.signs, function (sign) {
            this.bot.find('.signs').append('<img class="sign-thumb" src="' + sign + '"/>')
        }, this);
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

            if (previousPos.x > nextPos.x && previousPos.y > nextPos.y) {
                orientation = 'NE';
            }

            if (previousPos.x < nextPos.x && previousPos.y > nextPos.y) {
                orientation = 'WN';
            }

            if (previousPos.x < nextPos.x && previousPos.y < nextPos.y) {
                orientation = 'SW';
            }

            if (previousPos.x > nextPos.x && previousPos.y < nextPos.y) {
                orientation = 'ES';
            }
        }
        return orientation;
    },

    moveToPosition: function (prevposition, position, nextposition, callback) {
        var duration = 500;
        var orientation = this.defineOrientation(position, nextposition);
        if (orientation == 'ES' || orientation == 'WN' || orientation == 'NE' || orientation == 'SW') {
            duration = 750;
        }
        if (prevposition) {
            var $road = $('.road[x=' + prevposition.x + '][y=' + prevposition.y + ']').find('.move-arrow').fadeOut(function () {
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

    highlightRoad: function () {

        _.each(this.path, function (step, index) {
            var $road = $('.road[x=' + step.x + '][y=' + step.y + ']');

            var orientation = this.defineOrientation(step, this.path[index + 1]);

            var toAppend = '';
            if (orientation == 'E' || orientation == 'ES') {
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
            if (index == this.path.length - 1) {
                toAppend = '<div class="move-arrow text-center"><i class="fa fa-plus-circle"></i></div>';
            }

            $road.append(toAppend)
            if (orientation == 'ES' || orientation == 'WN' || orientation == 'NE' || orientation == 'SW') {
                $road.find('.move-arrow').find('i').css('transform', 'rotate(-45deg)')
            }
        }, this)


        // $('.move-arrow').css({'border': Math.floor(this.gridSize * 0.08) + 'px dashed rgba(161, 255, 0, 0.7)'})

        $('.move-arrow').find('i').css({
            'font-size': Math.ceil(this.gridSize * 3.5) + '%',
            'padding-top': Math.ceil(this.gridSize * 0.24) + 'px',
        })


    },

    disableOtherPaths: function () {
        var context = this;
        $('.road').each(function () {
            var $road = $(this)
            var x = parseInt($road.attr('x'));
            var y = parseInt($road.attr('y'));

            if (!_.findWhere(context.path, {x: x, y: y})) {
                $road.css('opacity', '0.5');
            }


        })
    },

    hideEndPoints: function () {

        _.each(this.mapObjects.endPoints, function (endPoint) {
            if (!_.findWhere(this.path, {x: endPoint.x, y: endPoint.y})) {
                $('.base-grid[x="' + endPoint.x + '"][y="' + endPoint.y + '"]').find('.end-point').hide();
                console.log('end point', endPoint)
            }
        }, this)

    }

}, ['animatesprite', 'pathfinding']);