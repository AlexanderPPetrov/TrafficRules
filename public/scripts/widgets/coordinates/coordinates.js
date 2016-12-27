Backbone.widget({

    model: {},


    events: {},

    listen: {
        'SHOW_COORDINATES': 'showCoordinates',
        'CALCULATE_COORDINATES': 'calculateCoordinates',
        'HIDE_COORDINATES': 'hideCoordinates'
    },

    loaded: function () {


    },

    render: function () {

    },

    calculateCoordinates: function (coordinatesData) {

        this.$el.find('.coordinates').html('');
        var $container = this.$el.find('.coordinates');
        console.log('coordinates data received', coordinatesData);


        if(coordinatesData.edit){
            var coordinateRows = coordinatesData.rows;
            var coordinateCols = coordinatesData.cols;

            this.$el.find('.coordinates').css({'top': 0 + 'px', 'left': 0 + 'px'});
        }else{
            var offsetTop = -coordinatesData.rows * coordinatesData.gridSize;
            var offsetLeft = -coordinatesData.cols * coordinatesData.gridSize;
            this.$el.find('.coordinates').css({'top': offsetTop + 'px', 'left': offsetLeft + 'px'});

            var coordinateRows = coordinatesData.rows * 3;
            var coordinateCols = coordinatesData.cols * 3;
        }

        for (var i = 0; i < coordinateRows; i++) {
            for (var j = 0; j < coordinateCols; j++) {
                $container.append('<div class="coordinate-grid" style="width:' + coordinatesData.gridSize + 'px; height:' + coordinatesData.gridSize + 'px; top: ' + coordinatesData.gridSize * i + 'px; left:' + coordinatesData.gridSize * j + 'px;"></div>');
              //  if(i == coordinatesData.rows){
                    $('.coordinate-grid').last().append('<div class="coordinate-y"></div>')
             //   }
            }
        }



    },

    showCoordinates: function () {
        this.$el.find('.coordinates').show();
    },

    hideCoordinates: function () {
        this.$el.find('.coordinates').hide();
    }


}, []);