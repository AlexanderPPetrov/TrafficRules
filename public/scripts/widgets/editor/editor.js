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
    randomObjects: {
        "objects": [
            {
                "src": "block_01",
                "label": "Block 01"
            },
            {
                "src": "block_02",
                "label": "Block 01"
            },
            {
                "src": "block_03",
                "label": "Block 01"
            },
            {
                "src": "center_01",
                "label": "Center 01"
            },
            {
                "src": "factory_01",
                "label": "Factory 01"
            },
            {
                "src": "gas_01",
                "label": "Gas 01"
            },
            {
                "src": "h_01",
                "label": "Gas 01"
            },
            {
                "src": "tree_01",
                "label": "Tree 01"
            },
            {
                "src": "tree_02",
                "label": "Tree 01"
            },
            {
                "src": "tree_03",
                "label": "Tree 01"
            },
            {
                "src": "tree_04",
                "label": "Tree 01"
            },
            {
                "src": "tree_05",
                "label": "Tree 01"
            },
            {
                "src": "store_01",
                "label": "Store 01"
            },
            {
                "src": "hotel_01",
                "label": "Hote 01"
            },
            {
                "src": "hotel_01",
                "label": "Hotel 01"
            },
            {
                "src": "school",
                "label": "School 01"
            },
            {
                "src": "hospital_01",
                "label": "School 01"
            }
        ]
    },
    selected: null,
    assetsUrl: 'https://res.cloudinary.com/mateassets/image/upload/v1536820257/tiles/',
    debug: true,

    events: {
        'click .map-object': 'displayInfoText',
        'click .road ': 'selectTile',
        'contextmenu .block': 'deselectTile',
        'mouseenter .base-grid': 'showSelection',
        'click .block': 'selectTile',
        'mouseleave .base-grid': 'hideSelection'
    },

    listen: {
        'NEW_LEVEL': 'newMap',
        'ROTATE_IMAGE': 'rotateImage',
        'REPLACE_IMAGE': 'replaceImage',
        'SET_INFO_TEXT': 'setInfoText',
        'REMOVE_IMAGE': 'removeImage',
        'ENABLE_DESELECT': 'enableDeselect',
        'DISABLE_DESELECT': 'disableDeselect',
        'SAVE_MAP': 'saveMap',
        'LOAD_EXAM': 'loadExam',
        'GET_MATRIX_DATA': 'sendMatrixData',
        'PLACE_PLAYER': 'positionPlayer',
        'ADD_QUESTION': 'addQuestion',
        'REMOVE_QUESTION': 'removeQuestion',


    },


    loaded: function () {
        //TODO enable deselect on mouseup outside of the map
        //this.enableDeselect();
        this.render();
    },

    render: function () {

        this.renderTemplate({
            template: 'gridmap',
            data: this.model,
            renderCallback: function () {
                this.setGridSize();
                this.initializeMap();
            }
        })
    },

    newMap: function (data) {
        this.rowCount = parseInt(data.rows);
        this.columnCount = parseInt(data.cols);
        this.render();
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
        this.boxSize = Math.floor($('#get-size').width() * 2/3 / factor );
        console.log('>>>',this.boxSize)
        this.rowWidthPx = (this.columnCount * 2 + 1) * this.boxSize;
        this.rowHeight = this.boxSize;

        var marginTop = (this.columnCount - this.rowCount)*this.boxSize;
        $('.grid-map-transform').css('marginTop', marginTop);
        this.getCoordinates();
    },

    getCoordinates: function () {
        var coordinatesData = {};
        coordinatesData.gridSize = this.boxSize;
        coordinatesData.cols = this.columnCount * 2 + 1;
        coordinatesData.rows = this.rowCount * 2 + 1;
        this.fire('CALCULATE_COORDINATES', coordinatesData);
    },

    initializeMap: function () {
        this.mapMatrix = Map.getMapMatrix(this.rowCount * 2 + 1, this.columnCount * 2 + 1);
        this.definePath(this.mapMatrix);

        $('#grid-container').find('.r').css({'width': this.rowWidthPx, 'height': this.rowHeight});
        $('#grid-container').find('.road, .block').css({
            'width': this.boxSize,
            'height': this.boxSize
        });

        $('#grid-container').find('.road, .block').addClass('base-grid');

        this.mapTiles(this.mapMatrix);
        this.renderGrass();
        this.renderHouses();
        this.renderRoadTiles();
        this.setIndexes();
        this.initFogOfWar();
        this.placePlayer({x: 0, y: 1}, 'player_01_E');
        $('.grid-map-transform').animate({opacity: 1});

    },

    positionPlayer: function(position) {
        this.placePlayer({x: position.x, y: position.y}, 'player_01_E');

    },

    addQuestion: function(position){
        var $container = this.$el.find('.base-grid[posx="'+position.x+'"][posy="'+ position.y +'"]');
        if($container.attr('question') == 'true'){
            return;
        }
        var $mapObject = $container.find('.map-object');
        var $clonedImage = $mapObject.find('img').clone();
        $clonedImage.attr('src', 'assets/img/tiles/objects/question.png').addClass('question-mark');
        $mapObject.append($clonedImage);
        $container.attr('question','true');

    },
    removeQuestion: function(position) {
        var $container = this.$el.find('.base-grid[posx="'+position.x+'"][posy="'+ position.y +'"]');
        $container.removeAttr('question');
        $container.find('.question-mark').remove();

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
        canvas.css({top: -this.boxSize+ 'px', left: -this.boxSize + 'px'})
        // black out the canvas
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, fogWidth, fogHeight);
        // set up our "eraser"
        ctx.globalCompositeOperation = 'destination-out';


    },

    revealFog: function (posX, posY) {
        var fogWidth = (this.columnCount * 2 + 3) * this.boxSize,
            fogHeight = (this.rowCount * 2 + 3) * this.boxSize,
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

        var roadTiles = [];
        for (var i = 0; i < mapMatrix.length; i++) {
            for (var j = 0; j < mapMatrix[i].length; j++) {

                //Set attributes posx and posy to .base-grid
                var $row = $(this.$el.find('.r').get(i));
                var $col = $($row.find('.base-grid').get(j));
                $col.attr({"posx": j, "posy": i});
                $col.css({'left': this.boxSize * j, 'top': this.boxSize * i});
                var currentTile = mapMatrix[i][j];
                if (currentTile == 0) {

                    // Defined by each of the nearest tiles to Current
                    //
                    //      [1]                R L T B / E W N S
                    //   [1][C][1]    -> push [1,1,1,0] -> stands for _|_ road tile
                    //      [0]
                    //
                    //-------------------------------------
                    var roadTile = [];
                    mapMatrix[i][j + 1] !== undefined ? roadTile.push(mapMatrix[i][j + 1]) : roadTile.push(1);
                    mapMatrix[i][j - 1] !== undefined ? roadTile.push(mapMatrix[i][j - 1]) : roadTile.push(1);
                    if (mapMatrix[i - 1] !== undefined ) {
                        mapMatrix[i - 1][j] !== undefined ? roadTile.push(mapMatrix[i - 1][j]) : roadTile.push(1);
                    }
                    if (mapMatrix[i + 1] !== undefined ) {
                        mapMatrix[i + 1][j] !== undefined ? roadTile.push(mapMatrix[i + 1][j]) : roadTile.push(1);
                    }
                    roadTiles.push(roadTile);

                }
            }

        }

        // If first or last row -> Entrance | and Exit | road tiles
        roadTiles[0] = [0, 0, 1, 1];
        roadTiles[roadTiles.length - 1] = [0, 0, 1, 1];
        this.roadTiles = [];
        for (var k = 0; k < roadTiles.length; k++) {
            this.roadTiles.push(this.getRoadTileImage(roadTiles[k]));
        }
    },

    setIndexes: function () {
        this.$el.find('.r').each(function () {
            $(this).find($('.base-grid').get().reverse()).each(function (index, gridTile) {
                $(gridTile).css('zIndex', index);
            })
        })
    },

    getRoadTileImage: function (tileArray) {

        var roadTileImage = 'road-';
        var tileArray = tileArray.toString();
        switch (tileArray) {
            case '1,1,0,0':
                roadTileImage += '01';
                break;
            case '0,0,1,1':
                roadTileImage += '02';
                break;
            case '0,0,0,0':
                roadTileImage += '03';
                break;
            case '0,1,1,0':
                roadTileImage += '04';
                break;
            case '1,0,1,0':
                roadTileImage += '05';
                break;
            case '1,0,0,1':
                roadTileImage += '06';
                break;
            case '0,1,0,1':
                roadTileImage += '07';
                break;
            case '0,1,0,0':
                roadTileImage += '08';
                break;
            case '1,0,0,0':
                roadTileImage += '09';
                break;
            case '0,0,0,1':
                roadTileImage += '10';
                break;
            case '0,0,1,0':
                roadTileImage += '11';
                break;
            case '1,1,0,1':
                roadTileImage += '12';
                break;
            case '1,1,1,0':
                roadTileImage += '13';
                break;
            case '1,0,1,1':
                roadTileImage += '14';
                break;
            case '0,1,1,1':
                roadTileImage += '15';
                break;
        }

        return roadTileImage;
    },

    renderGrass: function () {
        this.$el.find('.block').each(function () {
            var randomGrass = Math.floor((Math.random() * 5) + 1);
            var grass = '<img class="grid-image" src="assets/img/tiles/objects/' + 1 + '.jpg"/>'
            $(this).append(grass);

        })
    },

    renderRoadTiles: function () {
        var context = this;
        this.$el.find('.road').each(function (index, roadTile) {
            $(roadTile).addClass(context.roadTiles[index])
            if(!$(roadTile).find('.map-image').length){
                var roadObject = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="road"><img class="grid-image map-image" src="assets/img/tiles/objects/blank.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>';
                $(roadTile).append(roadObject);
                var $lastPlaced = $(roadTile).find('.map-image');
                var invertedOffsetX = -context.boxSize - 5;
                var offsetY = context.boxSize - 5;
                var matrix = 'matrix(1, 1, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
                $lastPlaced.css('transform', matrix);
            }

        });

        this.$el.find('.grid-image').css({'width': this.boxSize, 'height': this.boxSize})
    },

    renderHouses: function (e) {
        var context = this;
        var blockCounter = 0;
        for (var i = 0; i < this.mapMatrix.length; i++) {
            for (var j = 0; j < this.mapMatrix[i].length; j++) {
                if (this.mapMatrix[i][j] == 1) {


                    if(i == 0 ||  j == 0 || i == this.mapMatrix.length-1 || j == this.mapMatrix[i].length-1){
                        var treeNumber = context.zeroFill(Math.floor((Math.random() * 4) + 1), 2);
                        var tree = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="Tree"><img class="grid-image map-image" src="assets/img/tiles/objects/tree_' + treeNumber + '.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
                        $(this.$el.find('.block').get(blockCounter)).append(tree);
                    }else{

                        var house = '<div class="map-object" style="width:' + context.boxSize + 'px; height:' + context.boxSize + 'px;" data-info="Family house"><img class="grid-image map-image" src="assets/img/tiles/objects/'+ this.getRandomTile() +'.png" style="width:' + context.boxSize + 'px; pointer-events:none;" /></div>'
                        $(this.$el.find('.block').get(blockCounter)).append(house);
                    }
                    blockCounter++;

                }

                var $lastPlaced = context.$el.find('.map-image').last();
                var invertedOffsetX = -context.boxSize - 5;
                var offsetY = context.boxSize - 5;
                var matrix = 'matrix(1, 1, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
                $lastPlaced.css('transform', matrix);


            }
        }

    },

    getRandomTile: function(){
        var randomInt = this.getRandomArbitrary(0, this.randomObjects.objects.length);
        return this.randomObjects.objects[randomInt].src;
    },
    getRandomArbitrary: function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },

    loadSavedTiles: function (images) {

        _.each(images, function(image){
            image.src = this.assetsUrl + image.src + '.png';

            var $mapObject = '<div class="map-object" style="width:' + this.boxSize + 'px; height:' + this.boxSize + 'px;" data-info="' + image.info + '"><img class="grid-image map-image" src="' + image.src + '" style="width:' + this.boxSize + 'px; pointer-events:none;" /></div>'
            var $container = this.$el.find('.base-grid[posx="'+image.x+'"][posy="'+ image.y +'"]');
            $container.append($mapObject);

            var $lastPlaced = this.$el.find('.map-image').last();
            var invertedOffsetX = Math.floor(-this.boxSize) - 5;
            var offsetY = this.boxSize - 5;
            var matrix = 'matrix(1, 1, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
            if (image.rotation) {
                matrix = 'matrix(-1, -1, -3, 3, ' + offsetY + ',' + invertedOffsetX + ')';
            }
            $lastPlaced.css('transform', matrix);

            if(image.question){
                $container.attr('question', 'true');
                var $clonedImage = $container.find('img').clone();
                $clonedImage.attr('src', 'assets/img/tiles/objects/question.png').addClass('question-mark');
                $container.find('.map-object').append($clonedImage);
            }
        }, this)


    },

    selectTile: function (e) {
        this.selected = $(e.currentTarget);
        this.$el.find('.base-grid-selected').remove();
        this.$el.find('.selected-map-object').removeClass('selected-map-object');

        this.selected.find('.map-object').addClass('selected-map-object');
        this.selected.prepend('<div class="base-grid-selected"><div class="selected-inner"></div></div>');
        this.$el.find('.base-grid-selected').last().css({'width': this.boxSize, 'height': this.boxSize})

        var blockData = {};
        blockData.x = this.selected.attr('posx');
        blockData.y = this.selected.attr('posy');
        blockData.image = this.selected.find('.map-image').attr('src');
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
        var currentMatrix = this.selected.find('.map-image').css('transform');
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
        this.selected.find('.map-image').css('transform', newMatrix);
    },

    replaceImage: function (imageSrc) {
        if (this.selected == null) {
            return
        }
        this.selected.find('.map-image').first().attr('src', imageSrc);
    },

    setInfoText: function (infoText) {
        if (this.selected == null) {
            return
        }
        this.selected.find('.map-image').parent().attr('data-info', infoText);
    },

    removeImage: function () {
        if (this.selected == null) {
            return
        }
        this.selected.find('.map-image').attr('src','assets/img/tiles/objects/blank.png');
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

    placePlayer: function (position, model) {
        var fogPosX = (position.x * this.boxSize) + this.boxSize,
            fogPosY = (position.y * this.boxSize) + this.boxSize

        this.revealFog(fogPosX, fogPosY);
        this.$el.find('.player').fadeOut(function () {
            $(this).remove();
        });
        model = this.assetsUrl + model + '.png';
        this.currPlayerPos = position;
        var $row = $('#grid-container').find('.r').get(this.currPlayerPos.y);
        var $playerPosition = $($row).find('.base-grid').get(this.currPlayerPos.x);
        this.renderTemplate({
            template: 'player',
            el: $($playerPosition),
            append: true,
            data: {modelImage: model, width: this.boxSize, height: this.boxSize},
            renderCallback: function () {
                var inversedOffset = Math.floor(-this.boxSize * 0.7);
                var matrix = 'matrix(0.66667, 0.66667, -1, 1, ' + Math.floor(this.boxSize * 0.3) + ',' + inversedOffset + ')';
                var $playerImage = this.$el.find('.player').find('img');
                $playerImage.css('transform', matrix);
            }
        });

    },

    saveMap: function (mapName) {

        var dataParams = {};
        dataParams.mapName = mapName;
        dataParams.mapData = this.getMapData();
        console.log(dataParams.mapData);

    },

    loadExam: function (exam) {
        this.model.exam = exam;
        var map = JSON.parse(this.model.exam.map);

        $('#grid-container').html('');
        this.mapMatrix = map.mapMatrix;
        this.rowCount = (map.mapMatrix.length - 1 ) * 0.5;
        this.columnCount = (map.mapMatrix[0].length - 1) * 0.5;
        this.setGridSize();
        this.definePath(this.mapMatrix);

        $('#grid-container').find('.r').css({'width': this.rowWidthPx, 'height': this.rowHeight});
        $('#grid-container').find('.road, .block').css({
            'width': this.boxSize,
            'height': this.boxSize
        });

        $('#grid-container').find('.road, .block').addClass('base-grid');


        this.mapTiles(this.mapMatrix);
        this.renderGrass();
        this.loadSavedTiles(map.images);
        this.renderRoadTiles();
        this.setIndexes();
        this.initFogOfWar();
        var playerX = parseInt(map.player.posx)
        var playerY = parseInt(map.player.posy)
        this.placePlayer({x: playerX, y: playerY}, map.player.image);

    },

    getMapData: function () {
        var mapData = {};

        mapData.mapMatrix = this.mapMatrix;
        mapData.images = [];

        this.$el.find('.map-image:not(.question-mark)').each(function () {
            var imageData = {};
            imageData.src = $(this).attr('src');
            imageData.src = imageData.src.split('/');
            imageData.src = imageData.src[imageData.src.length - 1];
            imageData.src = imageData.src.replace('.png', '');
            var currentMatrix = $(this).css('transform');
            var values = currentMatrix.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
            var a = values[0];
            if (a == '-1') {
                imageData.rotation = -1;
            }
            imageData.info = $(this).parent().attr('data-info');
            if($(this).closest('.base-grid').attr('question') == 'true'){
                imageData.question = true;
            }
            imageData.x = $(this).closest('.base-grid').attr('posx');
            imageData.y = $(this).closest('.base-grid').attr('posy');
            mapData.images.push(imageData);

        });

        mapData.player = {};
        mapData.player.image = this.$el.find('.player').find('img').attr('src');
        mapData.player.image = mapData.player.image.split('/');
        mapData.player.image = mapData.player.image[mapData.player.image.length - 1];
        mapData.player.image = mapData.player.image.replace('.png', '');
        mapData.player.posx = this.currPlayerPos.x;
        mapData.player.posy = this.currPlayerPos.y;

        return JSON.stringify(mapData);
    },

    sendMatrixData: function(){
        var matrixData = {
            'mapMatrix': this.mapMatrix,
            'gridSize': this.boxSize
        };
        this.fire('SEND_MATRIX_DATA', matrixData)
    }

}, ['map']);