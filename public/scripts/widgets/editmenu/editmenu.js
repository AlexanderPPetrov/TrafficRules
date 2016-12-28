Backbone.widget({

    model: {},

    events: {
        // Map control
        'change #edit-info-text':'setInfoText',
        'click #rotate-image':'rotateImage',
        'click #remove-image':'removeImage',
        'click #new-level': 'newLevel',
        'click #load-level': 'loadLevel'

    },

    listen: {
        'BLOCK_SELECTED': 'blockSelected',
        'DISPLAY_INFO': 'displayInfoText'
    },

    loaded: function () {
        this.$el.find(".base-container").draggable();

    },

    render: function () {

    },

    blockSelected: function(blockData){
        this.$el.find('.selected-x').html(blockData.x);
        this.$el.find('.selected-y').html(blockData.y);
        this.$el.find('#select-tile').val(blockData.image);
        this.$el.find('.building').attr('src', blockData.image)

    },
    displayInfoText: function(infoText){
        this.$el.find('#edit-info-text').val(infoText);
    },



    setInfoText: function(e){
        this.fire('SET_INFO_TEXT', $(e.currentTarget).val());
    },

    removeImage: function(){
        this.fire('REMOVE_IMAGE')
    },

    rotateImage: function(){
        this.fire('ROTATE_IMAGE')
    }


}, ['map','jqueryui']);