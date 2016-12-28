Backbone.widget({

    model: {},
    events: {},

    listen: {
        'SEND_MATRIX_DATA': 'setBotData',
        'ADD_BOT': 'addBot',
        'START_ASSISTANT':'startAssistant'
    },

    setBotData: function (mapData) {
        this.gridSize = mapData.gridSize;
        this.mapMatrix = mapData.mapMatrix;
        this.mapObjects = mapData.mapObjects;

        console.log(mapData);

    },

    startBot: function () {

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
    placeBot: function (posX, posY) {
        this.removeBot();
        this.$el.find('#bot-container').append('<div id="bot"></div>');
        this.bot = this.$el.find('#bot');
        var k = ((this.gridSize / 100) * this.bot.width()) / 100;

        var invertedOffsetX = Math.ceil(-this.gridSize*0.24 - 2);
        var offsetY = Math.ceil(0.6*this.gridSize);
        var matrix = 'matrix(1, 1, -2, 2, ' + offsetY + ',' + invertedOffsetX + ')';
        this.bot.css('transform', matrix);
        this.bot.css({'top': posX * this.gridSize, 'left': posY * this.gridSize});


        var newWidth = Math.round(k * this.bot.width());
        var newHeight = Math.round(k * this.bot.height());
        this.bot.css({'width': newWidth + 'px', 'height': newHeight + 'px'});
        var backgroundWidth = (12 * this.bot.width()) + 'px';
        var backgroundHeight = this.bot.height() + 'px';
        this.bot.css({ backgroundSize : backgroundWidth+' '+backgroundHeight });
        // console.log('background-size', this.bot.css('background-size'));
        // console.log('width', this.bot.width());
        // console.log('height', this.bot.height())
    },


    addBot: function () {
        this.fire('GET_MATRIX_DATA');
        this.placeBot(1, 0);
        this.startBot();
        this.findPath();

    },

    startAssistant: function(data){
        this.model.data = data;
        this.fire('GET_MATRIX_DATA');
        this.placeBot(this.model.data.posy, this.model.data.posx);
        this.startBot();
        this.findPath();
        this.defineOrientation(this.path[0],this.path[1])
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

                    if(diagonal){
                        if (nodes[r-1] !== undefined && nodes[r-1][c-1] !== undefined){
                            nodes[r][c].addVertex(nodes[r-1][c-1]);
                        }
                        if (nodes[r-1] !== undefined && nodes[r-1][c+1] !== undefined){
                            nodes[r][c].addVertex(nodes[r-1][c+1]);
                        }

                    }

                }

            }
        }

        var paths = [];
        var steps = [];
        _.each(this.mapObjects.endPoints, function(endPoint){
            var path = PathFinder.AStarSolver(nodes[this.model.data.posy][this.model.data.posx], nodes[endPoint.posy][endPoint.posx]);
            paths.push(path);
            steps.push(path.length);
        }, this)
        var shortestWay = Math.min.apply(null, steps)

        this.path = paths[steps.indexOf(shortestWay)];
        console.log(this.path )
        this.moveBot()

    },

    moveBot: function () {
        var context = this;
        var counter = 0;
        for (var i = 0; i < this.path.length; i++) {
            this.moveToPosition(this.path[i], function () {
                context.defineOrientation(context.path[counter],context.path[counter+1]);
                if (counter == context.path.length - 1) {
                    context.bot.fadeOut(function () {
                        $(this).remove();
                    });
                }
                counter++;
            });
        }
    },

    defineOrientation: function(previousPos,nextPos){
        if(nextPos){
            if(previousPos.x == nextPos.x && previousPos.y > nextPos.y){
                // console.log('NORTH | UP');
                this.bot.animateSprite('play', 'N')
            }
            if(previousPos.x == nextPos.x && previousPos.y < nextPos.y){
                // console.log('SOUTH | DOWN');
                this.bot.animateSprite('play', 'S')
            }
            if(previousPos.x > nextPos.x && previousPos.y == nextPos.y){
                // console.log('WEST | RIGHT');
                this.bot.animateSprite('play', 'W')
            }
            if(previousPos.x < nextPos.x && previousPos.y == nextPos.y){
                // console.log('EAST | LEFT');
                this.bot.animateSprite('play', 'E')
            }

        }
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
    }

}, ['animatesprite', 'pathfinding']);