Backbone.widget({
    template: false,

    model: [],
    rowCount: 4,
    columnCount: 4,
    rowWidthPx: 0,
    mapMatrix: null,
    currPlayerPos: {
        x: 0,
        y: 0
    },
    selected: null,
    mapObjects:{},
    mapData:{},


    events: {
        'click .map-object': 'displayInfoText',
        'click .move-arrow': 'movePlayer',
        'click .road ': 'deselectTile',
        // 'contextmenu .block': 'deselectTile',
        'mouseenter .base-grid': 'showSelection',

        'click .base-grid': 'selectTile',
        'mouseleave .base-grid': 'hideSelection',
        'click .make-road': 'makeRoad',
        'click .make-block': 'makeBlock'
    },

    listen: {
        'NEW_LEVEL': 'newMap',
        'NEW_BLANK_LEVEL': 'newBlankMap',
        'ROTATE_IMAGE': 'rotateImage',
        'REPLACE_IMAGE': 'replaceImage',
        'REPLACE_GROUND': 'replaceGround',
        'SET_INFO_TEXT': 'setInfoText',
        'REMOVE_IMAGE': 'removeImage',
        'ENABLE_DESELECT': 'enableDeselect',
        'DISABLE_DESELECT': 'disableDeselect',
        'SAVE_MAP': 'saveMap',
        'LOAD_MAP': 'loadMap',
        'GET_MATRIX_DATA': 'sendMatrixData'


    },


    loaded: function () {
        //TODO enable deselect on mouseup outside of the map
        //this.enableDeselect();
        this.render(true);
    },

    render: function (blank) {

        this.renderTemplate({
            template: 'editormap',
            data: this.model,
            renderCallback: function () {
                this.setGridSize();
                this.initializeMap(blank);
            }
        })
    },

    newMap: function (data) {
        this.rowCount = parseInt(data.rows);
        this.columnCount = parseInt(data.cols);
        this.render();
    },

    newBlankMap: function (data) {
        this.rowCount = parseInt(data.rows);
        this.columnCount = parseInt(data.cols);
        this.render(true);
    },

    enableDeselect: function () {
        var context = this;
        $("HTML").on('mouseup', function (e) {
            var container = $(".grid-map-transform");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                context.deselectTile();
            }
        });
    },

    disableDeselect: function () {
        $("HTML").off('mouseup')
    },

    setGridSize: function () {
        console.log(this.columnCount, this.rowCount)
        var factor = this.columnCount * 2 + 1
        if (this.columnCount < this.rowCount) {
            factor = this.rowCount * 2 + 1;

        }
        this.boxSize = Math.floor($('#get-size').width() * 2 / 3 / factor);
        console.log('>>>', this.boxSize)
        this.rowWidthPx = (this.columnCount * 2 + 1) * this.boxSize;
        this.rowHeight = this.boxSize;

        var marginTop = (this.columnCount - this.rowCount) * this.boxSize;
        $('.grid-map-transform').css('marginTop', marginTop);
        this.getCoordinates();
    },

    getCoordinates: function () {
        var coordinatesData = {};
        coordinatesData.edit = true;
        coordinatesData.gridSize = this.boxSize;
        coordinatesData.cols = this.columnCount * 2 + 1;
        coordinatesData.rows = this.rowCount * 2 + 1;
        this.fire('CALCULATE_COORDINATES', coordinatesData);
    },

    initializeMap: function (blank) {


        if (blank) {
            this.mapMatrix = Map.getBlankMatrix(this.rowCount * 2 + 1, this.columnCount * 2 + 1);
        } else {
            this.mapMatrix = Map.getMapMatrix(this.rowCount * 2 + 1, this.columnCount * 2 + 1);
        }


        this.definePath(this.mapMatrix);

        $('#grid-container').find('.r').css({'width': this.rowWidthPx, 'height': this.rowHeight});
        $('#grid-container').find('.road, .block').css({
            'width': this.boxSize,
            'height': this.boxSize
        });

        console.log(this.boxSize)
        $('#grid-container').find('.road, .block').addClass('base-grid');

        this.mapTiles(this.mapMatrix);
        // this.renderGrass();
        if (!blank) {
            this.renderHouses();
            this.renderTiles();
        }

        this.setIndexes();
        this.initFogOfWar();
        // this.placePlayer({x: 0, y: 1}, 'assets/img/models/car_01_E.png');
        $('.grid-map-transform').animate({opacity: 1});

    },

    definePath: function (mapMatrix) {
        var $container = this.$el.find('#grid-container');

        for (var i = 0; i < mapMatrix.length; i++) {
            $container.append('<div class="r"></div>')
            for (var j = 0; j < mapMatrix[i].length; j++) {

                if (mapMatrix[i][j] == 0) {
                    $container.find('.r').last().append('<div class="road"></div>')
                } else {
                    $container.find('.r').last().append('<div class="block"></div>')
                }

            }
        }
    },

    initFogOfWar: function () {
        var fogWidth = (this.columnCount * 2 + 3) * this.boxSize,
            fogHeight = (this.rowCount * 2 + 3) * this.boxSize

        // init canvas
        var canvas = $('canvas'),
            ctx = canvas[0].getContext('2d'),
            overlay = 'rgba( 0, 0, 0, 1 )';

        canvas.attr('width', fogWidth);
        canvas.attr('height', fogHeight);
        canvas.css({top: -this.boxSize + 'px', left: -this.boxSize + 'px'})
        // black out the canvas
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, fogWidth, fogHeight);
        // set up our "eraser"
        ctx.globalCompositeOperation = 'destination-out';


    },

    revealFog: function (x, y) {
        var fogWidth = (this.columnCount * 2 + 3) * this.boxSize,
            fogHeight = (this.rowCount * 2 + 3) * this.boxSize,
            canvas = $('canvas'),
            ctx = canvas[0].getContext('2d'),
            ctx2 = canvas[1].getContext('2d'),
            r1 = this.boxSize,
            r2 = this.boxSize * 3,
            density = .4,
            hideFill = 'rgba( 0, 0, 0, .3 )'

        var pX = x,
            pY = y;

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

        if (this.mapMatrix != null) {
            return this.mapMatrix;
        }
        var mapMatrix = [];

        var $tiles = this.$el.find('#grid-container').find('.base-grid');
        var tilesIndex = 0;
        for (var i = 0; i < rowCount; i++) {
            mapMatrix[i] = [];
            for (var j = 0; j < colCount; j++) {
                if ($($tiles[tilesIndex]).hasClass('block')) {
                    mapMatrix[i][j] = 1;
                } else mapMatrix[i][j] = 0;

                tilesIndex++;
            }
        }

        return mapMatrix;
    },

    mapTiles: function (mapMatrix) {

        console.log(mapMatrix)
        var tiles = [];
        for (var i = 0; i < mapMatrix.length; i++) {
            for (var j = 0; j < mapMatrix[i].length; j++) {

                //Set attributes x and y to .base-grid
                var $row = $(this.$el.find('.r').get(i));
                var $col = $($row.find('.base-grid').get(j));
                $col.attr({"x": j, "y": i});
                $col.css({'left': this.boxSize * j, 'top': this.boxSize * i});
                var currentTile = mapMatrix[i][j];
                // if (currentTile == 0) {

                    // Defined by each of the nearest tiles to Current
                    //
                    //   [9][2][3]               R L T B / E W N S
                    //   [8][1][4]    -> push [1,1,1,0] -> stands for _|_ road tile
                    //   [7][6][5]
                    //
                    //-------------------------------------
                    var tileData = [];
                    //[1]
                    tileData.push(mapMatrix[i][j]);
                    //[2]
                    if (mapMatrix[i - 1] !== undefined) {
                        mapMatrix[i - 1][j] !== undefined ? tileData.push(mapMatrix[i - 1][j]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }
                    //[3]
                    if (mapMatrix[i - 1] !== undefined) {
                        mapMatrix[i - 1][j + 1] !== undefined ? tileData.push(mapMatrix[i - 1][j + 1]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }
                    //[4]
                    mapMatrix[i][j + 1] !== undefined ? tileData.push(mapMatrix[i][j + 1]) : tileData.push(1);
                    //[5]
                    if (mapMatrix[i + 1] !== undefined) {
                        mapMatrix[i + 1][j + 1] !== undefined ? tileData.push(mapMatrix[i + 1][j + 1]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }
                    //[6]
                    if (mapMatrix[i + 1] !== undefined) {
                        mapMatrix[i + 1][j] !== undefined ? tileData.push(mapMatrix[i + 1][j]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }
                    //[7]
                    if (mapMatrix[i + 1] !== undefined) {
                        mapMatrix[i + 1][j - 1] !== undefined ? tileData.push(mapMatrix[i + 1][j - 1]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }
                    //[8]
                    mapMatrix[i][j - 1] !== undefined ? tileData.push(mapMatrix[i][j - 1]) : tileData.push(1);
                    //[9]
                    if (mapMatrix[i - 1] !== undefined) {
                        mapMatrix[i - 1][j - 1] !== undefined ? tileData.push(mapMatrix[i - 1][j - 1]) : tileData.push(1);
                    }else{
                        tileData.push(1)
                    }

                tiles.push(tileData);


                // }
            }

        }

        // If first or last row -> Entrance | and Exit | road tiles
        //tileDatas[0] = [0, 0, 1, 1];
        //tileDatas[tileDatas.length - 1] = [0, 0, 1, 1];
        this.tiles = [];
        for (var k = 0; k < tiles.length; k++) {
            this.tiles.push(this.getTileImage(tiles[k]));
        }
    },

    setIndexes: function () {
        this.$el.find('.r').each(function () {
            $(this).find($('.base-grid').get().reverse()).each(function (index, gridTile) {
                $(gridTile).css('zIndex', index);
            })
        })
    },

    getTileImage: function (tileArray) {

        var tileDataImage = 'grass_01';
        var tileArray = tileArray.toString();

        if(tileArray.slice(0,1) == 0){

            var horizontals =  tileArray.charAt(6) +  tileArray.charAt(14) +  tileArray.charAt(2)+tileArray.charAt(10);

            switch (horizontals){
                case '0011':
                    tileDataImage = 'road_02';
                    break;
                case '0000':
                    tileDataImage = 'road_03';
                    break;
                case '0110':
                    tileDataImage = 'road_04';
                    break;
                case '1010':
                    tileDataImage = 'road_05';
                    break;
                case '1001':
                    tileDataImage = 'road_06';
                    break;
                case '0101':
                    tileDataImage = 'road_07';
                    break;
                case '0100':
                    tileDataImage = 'road_08';
                    break;
                case '1000':
                    tileDataImage = 'road_09';
                    break;
                case '0001':
                    tileDataImage = 'road_10';
                    break;
                case '0010':
                    tileDataImage = 'road_11';
                    break;
                case '1101':
                    tileDataImage = 'road_12';
                    break;
                case '1110':
                    tileDataImage = 'road_13';
                    break;
                case '1011':
                    tileDataImage = 'road_14';
                    break;
                case '0111':
                    tileDataImage = 'road_15';
                    break;
                case '1100':
                    tileDataImage = 'road_01';
                    break;
            }

            // Specials
            switch (tileArray) {
                case '0,1,0,1,1,1,0,1,1':
                    tileDataImage = 'road_16';
                    break;
                case '0,1,1,1,0,1,1,1,0':
                    tileDataImage = 'road_17';
                    break;
                case '0,1,1,0,1,1,1,1,0':
                    tileDataImage = 'road_18';
                    break;
                case '0,1,0,1,1,0,1,1,1':
                    tileDataImage = 'road_19';
                    break;
                case '0,1,1,1,0,1,1,0,1':
                    tileDataImage = 'road_20';
                    break;
                case '0,1,1,0,1,1,0,1,1':
                    tileDataImage = 'road_21';
                    break;
                case '0,0,1,1,0,1,1,0,1':
                    tileDataImage = 'road_22';
                    break;
                case '0,0,1,0,1,1,0,1,1':
                    tileDataImage = 'road_23';
                    break;
                case '0,0,1,0,1,1,0,1,1':
                    tileDataImage = 'road_23';
                    break;
                case '0,1,1,0,1,0,1,1,0':
                    tileDataImage = 'road_24';
                    break;
                case '0,1,0,1,1,0,1,0,1':
                    tileDataImage = 'road_25';
                    break;
                case '0,0,1,1,1,1,0,1,1':
                    tileDataImage = 'road_21';
                    break;
            }


        }else{
            switch (tileArray) {
                case '1,0,1,0,1,1,1,1,1':
                    tileDataImage = 'grass_02';
                    break;
                case '1,0,1,0,1,1,1,1,0':
                    tileDataImage = 'grass_02';
                    break;
                case '1,0,1,0,0,1,1,1,0':
                    tileDataImage = 'grass_02';
                    break;
                case '1,1,1,1,1,0,1,0,1':
                    tileDataImage = 'grass_04';
                    break;
                case '1,1,1,1,1,0,1,0,0':
                    tileDataImage = 'grass_04';
                    break;
                case '1,1,0,1,0,0,1,0,1':
                    tileDataImage = 'grass_04';
                    break;
                case '1,1,1,1,0,0,1,0,1':
                    tileDataImage = 'grass_04';
                    break;
                case '1,1,0,0,1,0,1,1,1':
                    tileDataImage = 'grass_03';
                    break;
                case '1,0,0,1,1,1,0,0,1':
                    tileDataImage = 'grass_05';
                    break;
                case '1,0,1,0,1,1,0,1,0':
                    tileDataImage = 'grass_02';
                    break;
                case '1,0,1,0,0,1,1,1,1':
                    tileDataImage = 'grass_02';
                    break;
                case '1,1,1,1,0,0,1,0,0':
                    tileDataImage = 'grass_04';
                    break;
                case '1,0,1,1,1,1,0,0,1':
                    tileDataImage = 'grass_05';
                    break;
                case '1,1,0,0,1,0,0,1,1':
                    tileDataImage = 'grass_03';
                    break;
                default:
                    tileDataImage = 'grass_01';
            }
        }



        return tileDataImage;
    },

    renderGrass: function () {
        this.$el.find('.block').each(function () {
            var randomGrass = Math.floor((Math.random() * 5) + 1);
            var grass = '<img class="grid-image" src="assets/img/tiles/grass/' + 1 + '.jpg"/>'
            $(this).append(grass);

        })
    },

    renderTiles: function () {
        var context = this;
        this.$el.find('.base-grid').each(function (index, tileData) {

            var tile = '<img class="grid-image ground" src="assets/img/tiles/school/' + context.tiles[index] + '.jpg"/>'
            $(this).append(tile);
        })

        this.$el.find('.grid-image').css({'width': this.boxSize, 'height': this.boxSize})
    },

    renderHouses: function (e) {
        var context = this;
        var counter = 0;
        for (var i = 0; i < this.mapMatrix.length; i++) {
            for (var j = 0; j < this.mapMatrix[i].length; j++) {
                if (this.mapMatrix[i][j] == 1) {


                    if (i == 0 || j == 0 || i == this.mapMatrix.length - 1 || j == this.mapMatrix[i].length - 1) {
                        var treeNumber = context.zeroFill(Math.floor((Math.random() * 4) + 1), 2);
                        var tree = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="Tree"><img class="grid-image house" src="assets/img/tiles/nature/tree_' + treeNumber + '.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
                        $(this.$el.find('.block').get(counter)).append(tree);
                    } else {
                        var houseNumber = context.zeroFill(Math.floor((Math.random() * 2) + 1), 2);
                        var house = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="Family house"><img class="grid-image house" src="assets/img/tiles/houses/h_' + houseNumber + '.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
                        $(this.$el.find('.block').get(counter)).append(house);
                    }


                    var $lastPlaced = context.$el.find('.house').last();
                    var invertedOffsetX = -context.boxSize - 5;
                    var offsetY = context.boxSize - 5;
                    var matrix = 'matrix(1, 1, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
                    $lastPlaced.css('transform', matrix);

                    counter++;
                }

            }
        }

        this.$el.find('.block').each(function () {

        })
    },

    renderBlankImages: function(){
        var context = this;
        var counter = 0;
        for (var i = 0; i < this.mapMatrix.length; i++) {
            for (var j = 0; j < this.mapMatrix[i].length; j++) {

                var house = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info=""><img class="grid-image house" src="assets/img/tiles/houses/blank.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
                $(this.$el.find('.base-grid').get(counter)).append(house);
                // console.log('counter', counter)
                var $lastPlaced = context.$el.find('.map-object').last();
                var invertedOffsetX = -context.boxSize;
                var matrix = 'matrix(1, 1, -3, 3, ' + context.boxSize + ',' + invertedOffsetX + ')';
                $lastPlaced.css('transform', matrix);
                counter++;

            }
        }
    },

    loadSavedTiles: function (images, grounds) {
        var context = this;

        _.each(images, function ( image,index) {
            $(context.$el.find('.base-grid').get(index)).find('.map-object').find('.grid-image').attr("src",image.src);
        })

        _.each(grounds, function ( ground) {
            console.log('====>',ground)
            $('.base-grid[x='+ ground.x +'][y=' + ground.y +']').find('.ground').attr("src",ground.src);
        })

    },

    selectTile: function (e) {
        this.selected = $(e.currentTarget);
        this.$el.find('.base-grid-selected').remove();
        this.$el.find('.selected-map-object').removeClass('selected-map-object');

        this.selected.find('.map-object').addClass('selected-map-object');
        this.selected.prepend('<div class="base-grid-selected"><div class="selected-inner"></div><div class="make-block"></div><div class="make-road"></div></div>');
        this.$el.find('.base-grid-selected').last().css({'width': this.boxSize, 'height': this.boxSize})

        var blockData = {};
        blockData.x = this.selected.attr('x');
        blockData.y = this.selected.attr('y');
        blockData.image = this.selected.find('.house').attr('src');
        blockData.ground = this.selected.find('.ground').attr('src');
        this.fire('BLOCK_SELECTED', blockData);

    },

    deselectTile: function (e) {
        this.selected = null;
        this.$el.find('.base-grid-selected').remove();
        this.$el.find('.selected-map-object').removeClass('selected-map-object');
        return false;
    },

    rotateImage: function () {
        if (this.selected == null) return;
        var currentMatrix = this.selected.find('.house').css('transform');
        var values = currentMatrix.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];
        var e = values[4];
        var f = values[5];
        if (a == '1') {
            a = '-1';
            b = '-1';
        } else {
            a = '1';
            b = '1';
        }
        var newMatrix = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')'
        this.selected.find('.house').css('transform', newMatrix);
    },

    replaceImage: function (imageSrc) {
        if (this.selected == null) {
            return
        }

        console.log(this.selected);
        this.selected.find('.house').attr('src', imageSrc);
    },

    replaceGround: function(imageSrc){
        if (this.selected == null) {
            return
        }
        console.log(this.selected);
        this.selected.find('.ground').attr('src', imageSrc);
    },


    setInfoText: function (infoText) {
        if (this.selected == null) {
            return
        }
        ;
        this.selected.find('.house').parent().attr('data-info', infoText);
    },

    removeImage: function () {
        if (this.selected == null) {
            return
        }
        ;
        this.selected.find('.house').remove();
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


    makeRoad: function (e) {
        console.log('make road')
        var $parent = $(e.currentTarget).closest('.base-grid');
        $parent.addClass('road').removeClass('block');
        var x = parseInt($parent.attr('x'));
        var y = parseInt($parent.attr('y'));
        this.mapMatrix[y][x] = 0;
    },

    makeBlock: function (e) {
        console.log('make block')
        var $parent = $(e.currentTarget).closest('.base-grid');
        $parent.addClass('block').removeClass('road');
        var x = parseInt($parent.attr('x'));
        var y = parseInt($parent.attr('y'));
        this.mapMatrix[y][x] = 1;
    },

    displayInfoText: function (e) {
        var dataInfo = $(e.currentTarget).attr('data-info');
        this.fire('DISPLAY_INFO', dataInfo);
    },

    movePlayer: function (e) {
        var $moveArrow = $(e.currentTarget);
        var newPosition = {
            x: $moveArrow.attr('x'),
            y: $moveArrow.attr('y')
        }
        this.$el.find('.move-arrow').remove();
        this.placePlayer(newPosition, 'assets/img/models/car_01_' + $moveArrow.attr('direction') + '.png')

    },

    placePlayer: function (position, model) {
        var fogx = (position.x * this.boxSize) + this.boxSize,
            fogy = (position.y * this.boxSize) + this.boxSize

        this.revealFog(fogx, fogy);
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

                    if (mapMatrix[i][j + 1] !== undefined && mapMatrix[i][j + 1] == 0) {
                        var $row = $(this.$el.find('.r').get(i));
                        var $col = $($row.find('.base-grid').get(j + 1));
                        $col.append('<div class="move-arrow text-center" direction="E"  x="' + (j + 1) + '" y="' + i + '"><i class="fa fa-long-arrow-right"></i></div>');
                    }

                    if (mapMatrix[i][j - 1] !== undefined && mapMatrix[i][j - 1] == 0) {
                        var $row = $(this.$el.find('.r').get(i));
                        var $col = $($row.find('.base-grid').get(j - 1));
                        $col.append('<div class="move-arrow text-center" direction="W" x="' + (j - 1) + '" y="' + i + '"><i class="fa fa-long-arrow-left"></i></div>');
                    }

                    if (mapMatrix[i - 1] !== undefined && mapMatrix[i - 1][j] !== undefined && mapMatrix[i - 1][j] == 0) {
                        var $row = $(this.$el.find('.r').get(i - 1));
                        var $col = $($row.find('.base-grid').get(j));
                        $col.append('<div class="move-arrow text-center" direction="N" x="' + j + '" y="' + (i - 1) + '"><i class="fa fa-long-arrow-up"></i></div>');
                    }

                    if (mapMatrix[i + 1] !== undefined && mapMatrix[i + 1][j] !== undefined && mapMatrix[i + 1][j] == 0) {
                        var $row = $(this.$el.find('.r').get(i + 1));
                        var $col = $($row.find('.base-grid').get(j));
                        $col.append('<div class="move-arrow text-center" direction="S" x="' + j + '" y="' + (i + 1) + '"><i class="fa fa-long-arrow-down"></i></div>');
                    }

                }

            }
        }
    },

    saveMap: function (mapName) {

        var dataParams = {};
        dataParams.mapName = mapName;
        dataParams.mapData = this.getMapData();
        console.log(dataParams.mapData);

    },

    loadMap: function (mapUrl) {
        this.ajaxRequest({
            url: mapUrl,
            data: {},
            type: "GET",
            success: function (response) {
                $('#grid-container').html('')
                this.mapMatrix = response.mapMatrix;
                this.rowCount = (response.mapMatrix.length - 1 ) * 0.5;
                this.columnCount = (response.mapMatrix[0].length - 1) * 0.5;
                console.log('rowCount: ', this.rowCount, 'colCount: ', this.columnCount);
                this.setGridSize();
                this.definePath(this.mapMatrix);

                $('#grid-container').find('.r').css({'width': this.rowWidthPx, 'height': this.rowHeight});
                $('#grid-container').find('.road, .block').css({
                    'width': this.boxSize,
                    'height': this.boxSize
                });

                $('#grid-container').find('.road, .block').addClass('base-grid');
                this.mapData.buildings = response.buildings;
                this.mapData.grounds = response.grounds;
                this.mapData.player = response.player;
                this.mapTiles(this.mapMatrix);
                this.renderBlankImages();
                this.renderTiles();
                this.loadSavedTiles(this.mapData.buildings, this.mapData.grounds);

                this.setIndexes();
                this.initFogOfWar();
                var playerX = parseInt(response.player.x);
                var playerY = parseInt(response.player.y);
                this.mapObjects.endPoints = response.endPoints;
                this.mapObjects.startPoints = response.startPoints;
                this.setPoints();

                // this.placePlayer({x: playerX, y: playerY}, response.player.image);
                this.sendMatrixData();
            }
        });
    },

    getMapData: function () {
        var mapData = {};

        mapData.mapMatrix = this.mapMatrix;
        mapData.images = [];

        this.$el.find('.house').each(function () {
            var imageData = {};
            imageData.src = $(this).attr('src');
            var currentMatrix = $(this).css('transform');
            if(currentMatrix != 'none'){
                var values = currentMatrix.split('(')[1];
                values = values.split(')')[0];
                values = values.split(',');
                var a = values[0];
                if (a == '-1') {
                    imageData.rotation = -1;
                }
            }else{
                imageData.rotation = 1;
            }

            imageData.info = $(this).parent().attr('data-info');
            imageData.x = $(this).closest('.base-grid').attr('x');
            imageData.y = $(this).closest('.base-grid').attr('y');
            mapData.images.push(imageData);

        })

        mapData.player = {};
        mapData.player.image = this.$el.find('.player').find('img').attr('src');
        mapData.player.x = this.currPlayerPos.x;
        mapData.player.y = this.currPlayerPos.y;

        return JSON.stringify(mapData);
    },

    sendMatrixData: function () {
        var matrixData = {
            'mapMatrix': this.mapMatrix,
            'gridSize': this.boxSize,
            'mapObjects': this.mapObjects
        }
        this.fire('SEND_MATRIX_DATA', matrixData)
    },

    setPoints: function(){
        _.each(this.mapObjects.startPoints, function(startPoint){
            $('.road[x='+ startPoint.x +'][y=' + startPoint.y +']').find('.map-object').append("<img class='grid-image start-point' src='assets/img/tiles/map/"+startPoint.img+"'/>")
            console.log($('.road[x='+ startPoint.x +'][y=' + startPoint.y +']'))
        })

        _.each(this.mapObjects.endPoints, function(endPoint){
            $('.road[x='+ endPoint.x +'][y=' + endPoint.y +']').find('.map-object').append("<img class='grid-image end-point' src='assets/img/tiles/map/end_point.png'/>")
        })
    }

}, ['map']);