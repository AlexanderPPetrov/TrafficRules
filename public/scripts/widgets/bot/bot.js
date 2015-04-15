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
        this.placeBot(1, 0)
        this.startBot();
       this.findPath();
        console.log(mapData);

    },

    startBot: function () {

        this.bot.animateSprite({
            fps: 12,
            loop: true,
            autoplay: false,
            animations: {
                walkEast: [0, 1, 2],
                walkNorth: [3, 4, 5],
                walkWest: [6, 7, 8],
                walkSouth: [9, 10, 11]
            },
            complete: function(){
                alert('Sprite animation complete!');
            }
        })


        this.bot.animateSprite('play', 'walkEast')
    },
    placeBot: function (posX, posY) {
        this.removeBot();
        this.$el.find('#bot-container').append('<div id="bot"></div>');
        this.bot = this.$el.find('#bot');
        var k = ((this.gridSize / 100) * this.bot.width()) / 100;

        var inversedOffsetX = Math.ceil(-this.gridSize*0.24 - 2);
        var offsetY = Math.ceil(0.6*this.gridSize);
        var matrix = 'matrix(1, 1, -2, 2, ' + offsetY + ',' + inversedOffsetX + ')';
        this.bot.css('transform', matrix);
        this.bot.css({'top': posX * this.gridSize, 'left': posY * this.gridSize});


        var newWidth = Math.round(k * this.bot.width());
        var newHeight = Math.round(k * this.bot.height());
        this.bot.css({'width': newWidth + 'px', 'height': newHeight + 'px'});
        var backgroundWidth = (12 * this.bot.width()) + 'px';
        var backgroundHeight = this.bot.height() + 'px';
        this.bot.css({ backgroundSize : backgroundWidth+' '+backgroundHeight });
        console.log('background-size', this.bot.css('background-size'))
        console.log('width', this.bot.width())
        console.log('height', this.bot.height())
    },


    addBot: function () {
        this.fire('GET_MATRIX_DATA')
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
                    if (nodes[r][c - 1] !== undefined) {
                        nodes[r][c].addVertex(nodes[r][c - 1]);
                    }
                    if (nodes[r - 1] !== undefined && nodes[r - 1][c] !== undefined) {
                        nodes[r][c].addVertex(nodes[r - 1][c]);
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
        var route = PathFinder.AStarSolver(nodes[1][0], nodes[this.mapMatrix.length-2][this.mapMatrix[0].length-1]);
        this.moveBot(route)

    },

    moveBot: function (path) {
        var context = this;
        var counter = 0;
        for (var i = 0; i < path.length; i++) {
            this.moveToPosition(path[i], function () {
                counter++
                if (counter == path.length) {
                    context.bot.fadeOut(function () {
                        $(this).remove();
                    });
                }
            });
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