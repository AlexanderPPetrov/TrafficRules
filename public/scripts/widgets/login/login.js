Backbone.widget({

    events: {
        "click .btn-login": "login"
    },

    loaded: function() {

      if (Backbone.session.userName!=null && Backbone.session.userName!='' && Backbone.session.userName!=undefined) {
          console.log('session', Backbone.session);
          Backbone.router.navigate('#admin', true);
      }

    },

    login: function(e) {
        e.preventDefault();

        var name = this.$el.find('#login-username').val();
        var password = this.$el.find('#login-password').val();


        this.ajaxRequest({
            url: 'login.ws',
            data: {"userName":name, "password":password},
            success: function(data) {

                Backbone.session = data;

                var hasInvalidUser = true;
                var user = "invalid"
                _.each(Backbone.session.groups, function(group) {
                    switch(group) {
                        case "admins":
                            hasInvalidUser = false;
                            user = "admins";
                            break;
                        case "geo_bundle_admin":
                            hasInvalidUser = false;
                            user = "geo_bundle_admin";
                            break;
                        case "geo_bundle_product_manager":
                            hasInvalidUser = false;
                            user = "geo_bundle_product_manager";
                            break;
                        case "world_wide_modeler":
                            hasInvalidUser = false;
                            user = "world_wide_modeler";
                            break;
                        case "world_wide_product_manager":
                            hasInvalidUser = false;
                            user = "world_wide_product_manager";
                            break;
                        default:
                            user = "invalid";
                            break;
                    }
                });


                this.$el.find('#username-span').html(Backbone.session.userName);

                if( hasInvalidUser == -1 ){
                    alert("You are not authorized to view this page.");
                    this.logout();
                    return;
                }

                Backbone.router.navigate('#admin', true);
            }
        })
    },

    logout: function() {

        this.ajaxRequest({
            url: 'logoff.ws',
            success: function() {
                Backbone.session.userName = null;
                this.$el.find('#username-span').html('');
            }
        });
    }

});