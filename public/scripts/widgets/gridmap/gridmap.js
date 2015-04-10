Backbone.widget({
    template: false,

    model: [],
    rowCount: 4,
    columnCount: 4,
    rowWidthPx: 0,
    currentPlayerPosition:0,


    events: {
        'click .map-object': 'displayInfoText',
        'mouseenter .base-grid': 'showSelection',
        'mouseleave .base-grid': 'hideSelection'
    },

    listen: {
        'NEW_LEVEL': 'newLevel',
        'MOVE_TO_NEXT': 'moveToNext'

    },

    newLevel: function(data){
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
        $('#grid-container').find('.b, .w').css({
            'width': this.boxSize,
            'height': this.boxSize
        });

        $('#grid-container').find('.b, .w').addClass('base-grid');


        var mapMatrix = this.getMapMatrix(this.columnCount * 2 + 1, this.rowCount * 2 + 1);
        this.mapTiles(mapMatrix);
        this.renderScene();
        this.placePlayer(0, 'car_01.png');

    },


    getMapMatrix: function (colCount, rowCount) {
        this.roadTiles = [];
        var mapMatrix = [];

        var $tiles = this.$el.find('#grid-container').find('.base-grid');
        var tilesIndex = 0;
        for (var i = 0; i < rowCount; i++) {
            mapMatrix[i] = [];
            for (var j = 0; j < colCount; j++) {
                if ($($tiles[tilesIndex]).hasClass('w')) {
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
                    if(mapMatrix[i - 1]){
                        mapMatrix[i - 1][j] ? roadTile.push(mapMatrix[i - 1][j]) : roadTile.push(0);
                    }
                    if(mapMatrix[i + 1]){
                        mapMatrix[i + 1][j] ? roadTile.push(mapMatrix[i + 1][j]) : roadTile.push(0);
                    }
                    roadTiles.push(roadTile);
                }
            }
        }

        // If first or last row -> Entrance | and Exit | road tiles
        roadTiles[0] = [1, 1, 0, 0];
        roadTiles[roadTiles.length - 1] = [1, 1, 0, 0];

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

        this.$el.find('.w').each(function () {

            var randomGrass = Math.floor((Math.random() * 5) + 1);
            var grass = '<img class="grid-image" src="assets/img/grass/' + 1 + '.jpg"/>'

            $(this).append(grass);
            var houseNumber = context.zeroFill(Math.floor((Math.random() * 3) + 1), 2);

            var house = '<div class="map-object" style="width:'+ context.boxSize +'px; height:' + context.boxSize + 'px;" data-info="Family house"><img class="grid-image house" src="assets/img/houses/h_'+ houseNumber +'.png" style="width:'+ context.boxSize +'px; pointer-events:none;" /></div>'
            $(this).append(house);

            var $lastPlaced = context.$el.find('.house').last();
            var inversedOffset =  Math.floor(- context.boxSize * 0.66667);
            var matrix = 'matrix(0.66667, 0.66667, -2, 2, ' + context.boxSize*0.57 +',' + inversedOffset +')';
            $lastPlaced.css('transform', matrix);


        })




        var context = this;
        this.$el.find('.b').each(function (index, roadTile) {
            $(roadTile).addClass(context.roadTiles[index])
        })

        this.$el.find('.grid-image').css({'width': this.boxSize, 'height': this.boxSize})

    },

    showSelection: function (e) {
        if ($(e.currentTarget).find('.grid-image').length > 0) {
            $(e.currentTarget).find('.grid-image').append('<div class="base-grid-marker"></div>');
            return;
        }
        $(e.currentTarget).prepend('<div class="base-grid-marker" style="width:100%; height:100%;"></div>')
        this.$el.find('.base-grid-marker').css({'width': this.boxSize, 'height': this.boxSize})
    },

    hideSelection: function (e) {
        this.$el.find('.base-grid-marker').remove();
    },

    displayInfoText: function (e) {
        var dataInfo = $(e.currentTarget).attr('data-info');
        this.fire('DISPLAY_INFO', dataInfo);
    },

    placePlayer: function (roadIndex, model) {
        this.currentPlayerPosition = roadIndex;
        var $playerPosition = $('#grid-container').find('.b').get(roadIndex);
        this.renderTemplate({
            template: 'player',
            el: $playerPosition,
            data: {modelImage: model, width: this.boxSize, height: this.boxSize},
            renderCallback: function(){
                var inversedOffset =  Math.floor(- this.boxSize * 0.7);
                var matrix = 'matrix(0.66667, 0.66667, -1, 1, ' + Math.floor(this.boxSize*0.3) +',' + inversedOffset +')';
                var $playerImage = this.$el.find('.player').find('img');
                $playerImage.css('transform', matrix);
            }
        })
    },

    moveToNext: function(){
        this.$el.find('.player').fadeOut(function(){
            $(this).remove();
        });
        this.currentPlayerPosition++;
        if(this.currentPlayerPosition == $('#grid-container').find('.b').length){
            this.currentPlayerPosition = 0;
        }
        this.placePlayer(this.currentPlayerPosition, 'car_01.png');
    }


}, ['map']);