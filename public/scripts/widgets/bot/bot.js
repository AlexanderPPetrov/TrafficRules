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
        this.placeBot(1,0)
        this.findPath()
        console.log(mapData);

    },

    startBot: function () {
        this.$el.find('#bot-container').append('<div id="bot"></div>');
        this.bot = this.$el.find('#bot');
        var inversedOffsetX = -this.gridSize - 5;
        var offsetY = 0;
        var matrix = 'matrix(0.67, 0.67, -1, 1, ' + offsetY + ',' + inversedOffsetX + ')';
        this.bot.css('transform', matrix);
        this.bot.sprite({fps: 9, no_of_frames: 3})
            .active();
        //this.bot.spState(2);

    },
    placeBot: function (posX, posY) {
        this.bot.css({'top': posX * this.gridSize, 'left': posY * this.gridSize})
    },

    moveBot: function(path){
        for (var i = 0; i < path.length; i++) {
            this.moveToPosition(path[i]);
        }
    },

    addBot: function () {
        this.fire('GET_MATRIX_DATA')
    },

    findPath: function () {
        var PathFinder = new PathFinding();

        var nodes = [];
        for (var r = 0; r<this.mapMatrix.length; r++){
            nodes[r] = [];
            for (var c = 0; c <this.mapMatrix[r].length; c++){

                if(this.mapMatrix[r][c] == 0){
                    // add nodes
                    nodes[r][c] = PathFinder.addNode(c, r);
                    // add verticies between nodes
                    if (nodes[r][c-1] !== undefined){
                        nodes[r][c].addVertex(nodes[r][c-1]);
                    }

                    if (nodes[r-1] !== undefined && nodes[r-1][c] !== undefined){
                        nodes[r][c].addVertex(nodes[r-1][c]);
                    }

                    // some more verticies, if we want diagonal movement
                    //if(diagonal){
                    //    if (nodes[r-1] !== undefined && nodes[r-1][c-1] !== undefined){
                    //        nodes[r][c].addVertex(nodes[r-1][c-1]);
                    //    }
                    //    if (nodes[r-1] !== undefined && nodes[r-1][c+1] !== undefined){
                    //        nodes[r][c].addVertex(nodes[r-1][c+1]);
                    //    }
                    //
                    //}
                }

            }
        }
        //node[r][c]
        console.log(nodes)
       var route = PathFinder.AStarSolver(nodes[1][0],nodes[7][8]);
       console.log(route);

        this.moveBot(route)

    },


    moveToPosition: function (position) {
        var t = position.y * this.gridSize;
        var l = position.x * this.gridSize;

        this.bot.animate({top: t + 'px', left: l + 'px'},{
            easing: "linear",
            duration:1000,
            complete: function(){
                //callback
            }
        });
    }

}, ['spritely', 'pathfinding']);