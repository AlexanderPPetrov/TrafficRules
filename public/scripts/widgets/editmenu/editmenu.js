Backbone.widget({

    model: {},

    events: {
        // Map control
        'change #edit-info-text':'setInfoText',
        'click #rotate-image':'rotateImage',
        'click #remove-image':'removeImage',
        'click #new-level': 'newLevel',
        'click #load-level': 'loadLevel',
        'click #place-player': 'placePlayer',
        'click #place-endpoint': 'placeEndpoint',
        'click #add-question': 'addQuestion',
        'click #remove-question': 'removeQuestion',

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
        this.posX = blockData.x;
        this.posY = blockData.y;
        this.$el.find('.selected-x').html(blockData.x);
        this.$el.find('.selected-y').html(blockData.y);
        this.$el.find('#select-tile').val(blockData.image);
        this.$el.find('.image-preview').attr('src', blockData.image)

    },
    displayInfoText: function(infoText){
        this.$el.find('#edit-info-text').val(infoText);
    },

    placePlayer: function(){
        this.fire('PLACE_PLAYER', {x: this.posX, y: this.posY});
    },
    placeEndpoint: function(){
        this.fire('PLACE_ENDPOINT', {x: this.posX, y: this.posY});
    },
    addQuestion: function(){
        this.fire('ADD_QUESTION', {x: this.posX, y: this.posY});
    },
    removeQuestion: function() {
        this.fire('REMOVE_QUESTION', {x: this.posX, y: this.posY});
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