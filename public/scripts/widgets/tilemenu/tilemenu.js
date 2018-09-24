Backbone.widget({

    model: {},
    template: false,
    assetsUrl: 'assets/img/tiles/objects/',
    events: {
        // Map control
        'change .toggle-search-type input':'toggleTileSearch',
        'click .thumb-container': 'selectTile'

    },

    listen: {
        'BLOCK_SELECTED': 'blockSelected'
    },

    loaded: function () {
        this.ajaxRequest({
            url: 'webservices/tiles.json',
            local: true,
            type: "GET",
            success: function (response) {
                this.model = response;
                for(var i = 0; i < response.tiles.length; i++){
                    var tilesSet = response.tiles[i];
                    for(var k = 0; k < tilesSet.images.length; k++){
                        tilesSet.images[k].src = this.assetsUrl + tilesSet.images[k].src + '.png';
                    }
                }
                this.render();
            }
        })
    },

    render: function () {
        this.renderTemplate({
            template: 'tilemenu',
            data: this.model,
            renderCallback: function () {
                this.$el.find(".base-container").draggable();
            }
        })
    },
    blockSelected: function(blockData){
        this.$el.find('.thumb-container-selected').removeClass('thumb-container-selected');
        this.$el.find('.image-preview[src="' + blockData.image + '"]').parent().addClass('thumb-container-selected');
    },

    selectTile: function(e){
        this.selected = $(e.currentTarget);
        this.$el.find('.thumb-container-selected').removeClass('thumb-container-selected');
        this.selected.addClass('thumb-container-selected');
        this.fire('REPLACE_IMAGE', this.selected.find('img').attr('src'))
    },


    toggleTileSearch: function(e){
        var $searchCheckbox = $(e.currentTarget);
        var dataType = $searchCheckbox.attr('data-type');
        if($searchCheckbox.is(':checked')){
            this.$el.find('.hide-by-type[data-type="'+ dataType +'"]').show();
        }else{
            this.$el.find('.hide-by-type[data-type="'+ dataType +'"]').hide();
        }
    }




}, ['map','jqueryui']);