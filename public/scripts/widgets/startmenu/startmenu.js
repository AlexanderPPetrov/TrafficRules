Backbone.widget({

    model: [],
    rowCount: 2,
    columnCount: 3,



    events: {

        'click .role' : 'switchRole',
        'click .role-name' : 'triggerSwitchRole'

    },

    loaded: function () {

    },

    triggerSwitchRole: function(e){
        $(e.currentTarget).parent().find('.role').trigger('click')
    },

    switchRole: function(e){
        var $selectedRole = $(e.currentTarget);

        this.$el.find('.role').removeClass('active-role');

        $selectedRole.addClass('active-role');

        var role = $selectedRole.attr('role');
        var imgSrc = $selectedRole.find('img').attr('src');
        var html = $selectedRole.find('.col-lg-8').html();

        var selectedRoleContainer = this.$el.find('.selected-role-container');
        selectedRoleContainer.find('img').attr('src',imgSrc)
        selectedRoleContainer.find('.selected-role').html(html)
    }





}, ['map']);