Backbone.widget({

    model: {},
    gridSize: 0,

    events: {

    },

    listen: {
        'SHOW_COORDINATES': 'showCoordinates',
        'HIDE_COORDINATES': 'hideCoordinates'
    },

    loaded: function () {


    },

    render: function () {

    },

    showCoordinates: function(coordinatesData){
        console.log(coordinatesData)
        this.$el.find('.coordinates').html('');
        var $container = this.$el.find('.coordinates');
        var offsetTop = -(coordinatesData.rows-1)*0.5*coordinatesData.gridSize
        var offsetLeft = -(coordinatesData.cols-1)*0.5*coordinatesData.gridSize
        this.$el.find('.coordinates').css({'top': offsetTop +'px','left':offsetLeft + 'px'})
        var coordinateRows = coordinatesData.rows*2 - 1
        var coordinateCols = coordinatesData.cols*2 - 1
        for (var i = 0; i < coordinateRows; i++) {
            for (var j = 0; j < coordinateCols; j++) {
                $container.append('<div class="coordinate-grid" style="width:'+ coordinatesData.gridSize +'px; height:'+ coordinatesData.gridSize +'px; top: '+ coordinatesData.gridSize*j +'px; left:'+ coordinatesData.gridSize*i +'px;"></div>')
            }
        }

        this.$el.find('.coordinates').show();
    },

    hideCoordinates: function(){
        this.$el.find('.coordinates').hide();
    }



}, []);