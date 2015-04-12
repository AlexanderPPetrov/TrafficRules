Backbone.widget({

    model: {},

    events: {
        // Map control
        'change #select-tile':'changeImagePreview',
        'click #replace-image':'replaceImage',
        'click #rotate-image':'rotateImage',
        'click #remove-image':'removeImage',
        'click #new-level': 'newLevel',
        'click #load-level': 'loadLevel'

    },

    listen: {
        'BLOCK_SELECTED': 'blockSelected'
    },

    loaded: function () {
        $(".base-container").draggable();

    },

    render: function () {

    },

    blockSelected: function(blockData){
        this.$el.find('.selected-x').html(blockData.x);
        this.$el.find('.selected-y').html(blockData.y);
        this.$el.find('#select-tile').val(blockData.image);
        this.$el.find('.image-preview').attr('src', blockData.image)

    },
    changeImagePreview: function(){
        this.$el.find('.image-preview').attr('src',this.$el.find('#select-tile').val())
    },

    removeImage: function(){
        this.fire('REMOVE_IMAGE')
    },

    rotateImage: function(){
        this.fire('ROTATE_IMAGE')
    },

    replaceImage: function(){
        this.fire('REPLACE_IMAGE', this.$el.find('#select-tile').val())
    }


}, ['map','jqueryui']);