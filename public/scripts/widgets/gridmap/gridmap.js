Backbone.widget({
    template: false,

    model: [],
    rowCount: 4,
    columnCount: 4,
    rowWidthPx: 0,
    currPlayerPos: {
        x: 0,
        y: 0
    },
    selected: null,


    events: {
        'click .map-object': 'displayInfoText',
        'click .move-arrow': 'movePlayer',
        'mouseenter .base-grid': 'showSelection',
        'click .block': 'selectTile',
        'mouseleave .base-grid': 'hideSelection'
    },

    listen: {
        'NEW_LEVEL': 'newLevel',
        'REPLACE_IMAGE': 'replaceImage'

    },

    newLevel: function (data) {
        this.rowCount = data.rows;
        this.columnCount = data.cols;
        this.render();
    },

    loaded: function () {

        this.render();
    },

    render: function () {


        this.renderTemplate({
            template: 'gridmap',
            data: this.model,
            renderCallback: function () {
                this.setGridSize();
            }
        })
    },

    setGridSize: function () {
        this.boxSize = Math.floor(this.$el.find('#grid-container').width() / (this.columnCount * 2 + 1));
        this.rowWidthPx = (this.columnCount * 2 + 1) * this.boxSize;
        this.rowHeight = this.boxSize;
        this.initializeMap();
    },

    initializeMap: function () {

        Map.generate("grid-container", this.columnCount, this.rowCount, 1);
        $('#grid-container').find('.r').css({'width': this.rowWidthPx, 'height': this.rowHeight});
        $('#grid-container').find('.road, .block').css({
            'width': this.boxSize,
            'height': this.boxSize
        });

        $('#grid-container').find('.road, .block').addClass('base-grid');


        var mapMatrix = this.getMapMatrix(this.columnCount * 2 + 1, this.rowCount * 2 + 1);
        this.mapTiles(mapMatrix);
        this.renderScene();
        this.initFogOfWar();
        this.placePlayer({x: 0, y: 1}, 'car_01_E.png');

    },

    initFogOfWar: function () {
        var fogWidth = (this.columnCount * 2 + 2) * this.boxSize + 30,
            fogHeight = (this.rowCount * 2 + 2) * this.boxSize + 30

        // init canvas
        var canvas = $('canvas'),
            ctx = canvas[0].getContext('2d'),
            overlay = 'rgba( 0, 0, 0, 1 )';

        canvas.attr('width', fogWidth);
        canvas.attr('height', fogHeight);
        canvas.css({top: -this.boxSize * 0.5 + 'px', left: -this.boxSize * 0.5 + 'px'})
        // black out the canvas
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, fogWidth, fogHeight);
        // set up our "eraser"
        ctx.globalCompositeOperation = 'destination-out';


    },

    revealFog: function (posX, posY) {
        var fogWidth = (this.columnCount * 2 + 2) * this.boxSize + 30,
            fogHeight = (this.rowCount * 2 + 2) * this.boxSize + 30,
            canvas = $('canvas'),
            ctx = canvas[0].getContext('2d'),
            ctx2 = canvas[1].getContext('2d'),
            r1 = this.boxSize,
            r2 = this.boxSize * 3,
            density = .4,
            hideFill = 'rgba( 0, 0, 0, .3 )'

        var pX = posX,
            pY = posY;

        // reveal wherever we move
        var radGrd = ctx.createRadialGradient(pX, pY, r1, pX, pY, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(density, 'rgba( 0, 0, 0, .3 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx.fillStyle = radGrd;
        ctx.fillRect(pX - r2, pY - r2, r2 * 2, r2 * 2);

        // partially hide the entire map and re-reval where we are now
        ctx2.globalCompositeOperation = 'source-over';
        ctx2.clearRect(0, 0, fogWidth, fogHeight);
        ctx2.fillStyle = hideFill;
        ctx2.fillRect(0, 0, fogWidth, fogHeight);

        var radGrd = ctx.createRadialGradient(pX, pY, r1, pX, pY, r2);
        radGrd.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
        radGrd.addColorStop(.8, 'rgba( 0, 0, 0, .1 )');
        radGrd.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

        ctx2.globalCompositeOperation = 'destination-out';
        ctx2.fillStyle = radGrd;
        ctx2.fillRect(pX - r2, pY - r2, r2 * 2, r2 * 2);

    },

    getMapMatrix: function (colCount, rowCount) {

        var mapMatrix = [];

        var $tiles = this.$el.find('#grid-container').find('.base-grid');
        var tilesIndex = 0;
        for (var i = 0; i < rowCount; i++) {
            mapMatrix[i] = [];
            for (var j = 0; j < colCount; j++) {
                if ($($tiles[tilesIndex]).hasClass('block')) {
                    mapMatrix[i][j] = 0;
                } else mapMatrix[i][j] = 1;

                tilesIndex++;
            }
        }

        return mapMatrix;
    },

    mapTiles: function (mapMatrix) {

        var roadTiles = [];
        for (var i = 0; i < mapMatrix.length; i++) {
            for (var j = 0; j < mapMatrix[i].length; j++) {

                //Set attributes posx and posy to .base-grid
                var $row = $(this.$el.find('.r').get(j));
                var $col = $($row.find('.base-grid').get(i));
                $col.attr({"posx": i, "posy": j});

                var currentTile = mapMatrix[i][j]
                if (currentTile == 1) {
                    var roadTile = [];
                    // Defined by each of the nearest tiles to Current
                    //
                    //      [1]                R L T B / E W N S
                    //   [1][C][1]    -> push [1,1,1,0] -> stands for _|_ road tile
                    //      [0]
                    //
                    //-------------------------------------
                    mapMatrix[i][j + 1] ? roadTile.push(mapMatrix[i][j + 1]) : roadTile.push(0);
                    mapMatrix[i][j - 1] ? roadTile.push(mapMatrix[i][j - 1]) : roadTile.push(0);
                    if (mapMatrix[i - 1]) {
                        mapMatrix[i - 1][j] ? roadTile.push(mapMatrix[i - 1][j]) : roadTile.push(0);
                    }
                    if (mapMatrix[i + 1]) {
                        mapMatrix[i + 1][j] ? roadTile.push(mapMatrix[i + 1][j]) : roadTile.push(0);
                    }
                    roadTiles.push(roadTile);
                }
            }
        }

        // If first or last row -> Entrance | and Exit | road tiles
        roadTiles[0] = [1, 1, 0, 0];
        roadTiles[roadTiles.length - 1] = [1, 1, 0, 0];
        this.roadTiles = [];
        for (var k = 0; k < roadTiles.length; k++) {
            this.roadTiles.push(this.getRoadTileImage(roadTiles[k]));
        }
    },

    getRoadTileImage: function (tileArray) {

        var roadTileImage = 'road-';
        var tileArray = tileArray.toString();
        switch (tileArray) {
            case '0,0,1,1':
                roadTileImage += '01';
                break;
            case '1,1,0,0':
                roadTileImage += '02';
                break;
            case '1,1,1,1':
                roadTileImage += '03';
                break;
            case '1,0,0,1':
                roadTileImage += '04';
                break;
            case '0,1,0,1':
                roadTileImage += '05';
                break;
            case '0,1,1,0':
                roadTileImage += '06';
                break;
            case '1,0,1,0':
                roadTileImage += '07';
                break;
            case '1,0,1,1':
                roadTileImage += '08';
                break;
            case '0,1,1,1':
                roadTileImage += '09';
                break;
            case '1,1,1,0':
                roadTileImage += '10';
                break;
            case '1,1,0,1':
                roadTileImage += '11';
                break;
            case '0,0,1,0':
                roadTileImage += '12';
                break;
            case '0,0,0,1':
                roadTileImage += '13';
                break;
            case '0,1,0,0':
                roadTileImage += '14';
                break;
            case '1,0,0,0':
                roadTileImage += '15';
                break;
        }

        return roadTileImage;
    },

    renderScene: function () {
        var context = this;

        this.$el.find('.block').each(function () {

            var randomGrass = Math.floor((Math.random() * 5) + 1);
            var grass = '<img class="grid-image" src="assets/img/grass/' + 1 + '.jpg"/>'

            $(this).append(grass);
            var houseNumber = context.zeroFill(Math.floor((Math.random() * 3) + 1), 2);

            var house = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="Family house"><img class="grid-image house" src="assets/img/houses/h_' + houseNumber + '.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
            $(this).append(house);

            var $lastPlaced = context.$el.find('.house').last();
            var inversedOffset = Math.floor(-context.boxSize * 0.66667);
            var matrix = 'matrix(0.66667, 0.66667, -2, 2, ' + context.boxSize * 0.57 + ',' + inversedOffset + ')';
            $lastPlaced.css('transform', matrix);


        })


        var context = this;
        this.$el.find('.road').each(function (index, roadTile) {
            $(roadTile).addClass(context.roadTiles[index])
        })

        this.$el.find('.grid-image').css({'width': this.boxSize, 'height': this.boxSize})

    },

    selectTile: function(e){
        this.selected = $(e.currentTarget);
        this.$el.find('.base-grid-selected').remove();
        this.selected.prepend('<div class="base-grid-selected"><div class="selected-inner"></div></div>');
        this.$el.find('.base-grid-selected').last().css({'width':this.boxSize, 'height': this.boxSize})

        var blockData = {};
        blockData.x = this.selected.attr('posx');
        blockData.y = this.selected.attr('posy');
        blockData.image = this.selected.find('.house').attr('src');
        this.fire('BLOCK_SELECTED', blockData);

    },

    replaceImage: function(imageSrc){
        console.log('asdasd')
        this.selected.find('.house').attr('src', imageSrc);
    },

    showSelection: function (e) {
        var $currentGrid = $(e.currentTarget);
        if ($currentGrid.find('.move-arrow').length > 0) {
            $currentGrid.find('.move-arrow').find('i').css({
                'font-size': Math.ceil(this.boxSize * 3.5) + '%',
                'padding-top': Math.ceil(this.boxSize * 0.13) + 'px',
                'border': Math.floor(this.boxSize * 0.125) + 'px dashed rgba(161, 255, 0, 0.7)'
            })

            $currentGrid.find('.move-arrow').fadeIn('fast');
            this.$el.find('.base-grid-marker').remove();
            return;
        } else {
            this.$el.find('.move-arrow').hide();
        }

        if ($currentGrid.find('.grid-image').length > 0) {
            $currentGrid.find('.grid-image').append('<div class="base-grid-marker"></div>');
            return;
        }


        $currentGrid.append('<div class="base-grid-marker" style="width:100%; height:100%;"></div>')
        this.$el.find('.base-grid-marker').css({'width': this.boxSize, 'height': this.boxSize})
    },

    hideSelection: function (e) {
        this.$el.find('.base-grid-marker').remove();
    },

    displayInfoText: function (e) {
        var dataInfo = $(e.currentTarget).attr('data-info');
        this.fire('DISPLAY_INFO', dataInfo);
    },

    movePlayer: function (e) {
        var $moveArrow = $(e.currentTarget);
        var newPosition = {
            x: $moveArrow.attr('posx'),
            y: $moveArrow.attr('posy')
        }
        this.$el.find('.move-arrow').remove();
        this.placePlayer(newPosition, 'car_01_' + $moveArrow.attr('direction') + '.png')

    },

    placePlayer: function (position, model) {
        var fogPosX = (position.x * this.boxSize) + this.boxSize + 15,
            fogPosY = (position.y * this.boxSize) + this.boxSize + 15

        this.revealFog(fogPosX, fogPosY);
        this.$el.find('.player').fadeOut(function () {
            $(this).remove();
        });

        this.currPlayerPos = position;
        var $row = $('#grid-container').find('.r').get(this.currPlayerPos.y);
        var $playerPosition = $($row).find('.base-grid').get(this.currPlayerPos.x);
        this.renderTemplate({
            template: 'player',
            el: $($playerPosition),
            data: {modelImage: model, width: this.boxSize, height: this.boxSize},
            renderCallback: function () {
                var inversedOffset = Math.floor(-this.boxSize * 0.7);
                var matrix = 'matrix(0.66667, 0.66667, -1, 1, ' + Math.floor(this.boxSize * 0.3) + ',' + inversedOffset + ')';
                var $playerImage = this.$el.find('.player').find('img');
                $playerImage.css('transform', matrix);
            }
        })

        var mapMatrix = this.getMapMatrix(this.columnCount * 2 + 1, this.rowCount * 2 + 1);

        for (var i = 0; i < mapMatrix.length; i++) {
            for (var j = 0; j < mapMatrix[i].length; j++) {

                if (this.currPlayerPos.y == i && this.currPlayerPos.x == j) {

                    if (mapMatrix[i][j + 1] && mapMatrix[i][j + 1] == 1) {
                        var $row = $(this.$el.find('.r').get(i));
                        var $col = $($row.find('.base-grid').get(j + 1));
                        $col.append('<div class="move-arrow text-center" direction="E"  posx="' + (j + 1) + '" posy="' + i + '"><i class="fa fa-long-arrow-right"></i></div>');
                    }

                    if (mapMatrix[i][j - 1] && mapMatrix[i][j - 1] == 1) {
                        var $row = $(this.$el.find('.r').get(i));
                        var $col = $($row.find('.base-grid').get(j - 1));
                        $col.append('<div class="move-arrow text-center" direction="W" posx="' + (j - 1) + '" posy="' + i + '"><i class="fa fa-long-arrow-left"></i></div>');
                    }

                    if (mapMatrix[i - 1] && mapMatrix[i - 1][j] && mapMatrix[i - 1][j] == 1) {
                        var $row = $(this.$el.find('.r').get(i - 1));
                        var $col = $($row.find('.base-grid').get(j));
                        $col.append('<div class="move-arrow text-center" direction="N" posx="' + j + '" posy="' + (i - 1) + '"><i class="fa fa-long-arrow-up"></i></div>');
                    }

                    if (mapMatrix[i + 1] && mapMatrix[i + 1][j] && mapMatrix[i + 1][j] == 1) {
                        var $row = $(this.$el.find('.r').get(i + 1));
                        var $col = $($row.find('.base-grid').get(j));
                        $col.append('<div class="move-arrow text-center" direction="S" posx="' + j + '" posy="' + (i + 1) + '"><i class="fa fa-long-arrow-down"></i></div>');
                    }

                }

            }
        }
    }

}, ['map']);