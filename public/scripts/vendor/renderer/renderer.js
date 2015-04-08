/* Copyright (C) Novarto LTD - All Rights Reserved
 * Unauthorized copying or usage of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

define(['jquery', 'underscore', 'backbone' , 'cookies', 'util', 'when'], function ($, _, Backbone, Cookies, Util, when) {

    function Renderer() {

        //Get the servicepath for standalone app
        this.widgetPath = $("widget").attr('base-path');

        this.serializeFormAsObject = Util.serializeFormAsObject;

        this.destroy = function () {
            this.unbind();

            this.undelegateEvents();

//            console.log('DESTROY:',this.options.src);
            if (this.model != undefined && this.model.unbind != undefined ) {
                this.model.unbind()
            }


            this.$el.remove();

            this.remove();
        }
        /**
         * Attaches the widget to the event bus for the selected event and executes the callback when someone fires it
         * @param name
         * @param callback
         */
        this.listenFor = function (name, callback) {


            this.listenTo(Backbone.EventBus, name, callback);
        };

        /**
         * Fires an event on the eventbus
         * @param name
         * @param data
         */




        this.fire = function (name, data) {

            if(this.allWidgetsLoaded ==false) {
                logger.debug('storing event ',name);
                this.eventStack.push({
                    'name':name,
                    'data':data
                })
            } else {
                Backbone.EventBus.trigger(name, data);
            }


        };


        /**
         * Returns the currently loaded layout
         * @returns {*}
         */
        this.currentLayout = function () {
            return Backbone.currentLayout
        }

        this.loadTemplate = function (url, callback) {
            Backbone.loadTemplate(url, callback, this)

        },

            this.when = when;
        this.clean = false;


        /**
         * Returns the source folder of this widget
         * @returns {string}
         */
        this.sourceFolder = function () {
            return  this.options.src.substring(0, this.options.src.lastIndexOf('/'));
        }

        /**
         * Returns the assets folder of the widget   src = this.assetsFolder() + src
         * @returns {string}
         */
        this.assetsFolder = function () {
            return this.sourceFolder() + '/assets/'
        }


        this.asset = function (asset) {
            return this.assetsFolder() + asset;

        }


        /**
         * Renders templates and appends them to the specified el
         * expected parameters like
         *    this.appendTemplate({
         *     template : "template" // will look in the assets folder. By default it will load the template.html
         *     el : selector to the element to append the template to. Default is this.$el
         *     data : This function _will not_ modify in any way the data passed.  the json object with to use to render the template if any
         *     append : by default true
         *    })
         *
         *    Once a template is loaded it is cached to avoid further browser requests
         * @param templateOptions
         */

        this.appendTemplate = function (options) {


            if (options.context == undefined) {
                options.context = this;

            }

            var f = function (a) {
                if (a.length != 0) {

                    options.context.renderTemplate({
                        "template": options.template,
                        "data": a[0],
                        "el": options.el,
                        "append": true,
                        "renderCallback": function () {
                            a.shift()

                            f.call(options.context, a)

                        }

                    });

                } else {
                    if (options.callback !== undefined) {

                        options.callback.call(options.context)

                    }

                }


            }


            //We are not going to modify the original data inplace we are going to clone it first
            var data = JSON.parse(JSON.stringify(options.data));

            f(data)


        },

        /**
         * Fills html templates and renders them to the specified el
         * expected paramters like
         *    this.renderTemplate({
         *     html : " <tr> <td> {{boklil}} > <td> </tr>"  : you can provide your own data instead of template here
         *     template : "template" // will look in the assets folder. By default it will load the template.html
         *     el : selector to the element to append the template to. Default is this.$el or you can provide wrapped jquery object directly
         *     data : the json object with to use to render the template if any
         *     params : the params to pass to the webservice
         *     path: use the predefined path to the webservice in the layout
         *     webservice : the url from which to load the json data
         *     error: function -> function to be called if the loading of the webservice fail
         *     serviceCallback : if you want to transform the json data before rendering it you can write a function that will receive as arg the data returned from the service and you _must_ return some new data instead.
         *     renderCallback: this function will be executed after the template is rendered and placed in the element
         *     saveAs : if you are calling a webservice and you want the response stored to a local variable please state it's name here -> saveAs:'users' and access it like this.users afterwards
         *     append : true , if you want to append to element instead of replacing the content in the el
         *    })
         *
         *    Once a template is loaded it is cached to avoid further browser requests
         * @param templateOptions
         */

            //TODO pass context
            this.renderTemplate = function (templateOptions) {
                var deffered = when.defer();

                if ( this.template == false && templateOptions.template == 'template' ){
                    alert(  this.cid + ' ' +templateOptions.template + '.html - not loaded! When you use template = false, you have to choose different name for template in renderTemplate function.');
                    //return;
                }


                if (templateOptions.template == undefined && templateOptions.html == undefined) {
                    alert('you need to provide ether html or template for the renderTemplate to work');

                }


                if (templateOptions == undefined) {
                    templateOptions = {}
                }



                if(templateOptions.el == undefined) {
                    templateOptions.el = this.$el
                }else  {
                    templateOptions.el = $(templateOptions.el)
                }



                if (templateOptions.el.length == 0) {

                    alert('Please provide a correct selector for the render template function');
                }

                if (templateOptions.path !== undefined) {
                    templateOptions.webservice = this.path(templateOptions.path)
                }

                if (templateOptions.asset !== undefined) {

                    templateOptions.webservice = this.assetsFolder() + templateOptions.asset
                }


                if (templateOptions.webservice !== undefined && templateOptions.error === undefined) {
                    templateOptions.error = function (response) {

                        if (response.data == "invalid.session" || response.data=="not.logged") {
                            this.alert({
                                type: 'danger',
                                title: 'Webservice ' + templateOptions.webservice + ' error:',
                                message:  'Your session is expired, please login again!',
                                redirect: true
                            });

                        }else{
                            this.alert({
                                type: 'danger',
                                title: 'Webservice ' + templateOptions.webservice + ' error:',
                                message:  response.data
                            });
                        }




                    }
                }

                if (templateOptions.context === undefined) {
                    templateOptions.context = this;
                }


                //If we are loading the template from the assets folder
                if (templateOptions.template != undefined) {


                    if (templateOptions.template == 'template' || templateOptions.template == '__empty__') {

                        templateOptions.renderCallback = function () {

                            if (templateOptions.context.listen != undefined) {
                                for (p in  templateOptions.context.listen) {
                                    templateOptions.context.listenFor(p, templateOptions.context[ templateOptions.context.listen[p]])
                                }
                            }

                            if (templateOptions.context.options.callbackTemplateFirstRender !== undefined) {
                                templateOptions.context.options.callbackTemplateFirstRender(context)
                                templateOptions.context.options.callbackTemplateFirstRender == undefined

                            }

                            if (templateOptions.context.loaded !== undefined) {
                                templateOptions.context.options.deffered.resolve(templateOptions.context);
                                templateOptions.context.loaded();

                            }

                        }


                    }


                    var url = null;
                    if (templateOptions.template == '__empty__') {
                        url = templateOptions.template

                    } else {
                        url = this.assetsFolder() + templateOptions.template + ".html"
                    }


                    Backbone.loadTemplate(url, function (loadedTemplate) {

                        templateOptions.html = loadedTemplate

                        //If we are loading a template, and this template is the base template we must attach
                        //a render callback to be executed after the template is loaded


                        return  render(templateOptions,deffered)


                    });

                    //If we are providing the template via the html parameter
                } else if (templateOptions.html !== undefined) {


                    return render(templateOptions,deffered)

                }


                /**  It allows replacing the asset attribute with src pointing to the correct folder
                 *
                 * Renders the template
                 * @param templateOptions
                 */
                function render(templateOptions,deffered) {

                    var $html = $('<div/>');

                    templateOptions.html = templateOptions.html.replace(/src/g,'__wtf__');


                    var workaround =  $(Util.trim(templateOptions.html))



                    $html.append(workaround);
                    var context = templateOptions.context;

                    //replace asset with src
                    _.each($html.find('[asset]'), function (el) {

                        var src = $(el).attr('asset')
                        src = this.assetsFolder() + src
                        $(el).attr('src', src)
                        $(el).removeAttr('asset')

                    }, templateOptions.context);

                    $html.html($html.html().replace(new RegExp('({{)\\s+', 'g'), '$1'));
                    $html.html($html.html().replace(new RegExp('\\s+(}})', 'g'), '$1'));

                    //speed optimization, replacement of each with while

                    var $iterates = $html.find('[iterate]');
                    var iteratesLength = $iterates.length;
                    var i = 0;
                    while (i<iteratesLength) {

                        var children = $($iterates[i]).find('[iterate]');
                        if (children.length>0) {

                            var childrenLength = children.length;
                            var j = 0;
                            while (j<childrenLength) {
                                child = children[j];

                                var iterateValue = $(child).attr('iterate');
                                if (iterateValue.indexOf('element.')==-1) {
                                    iterateValue = 'element.' + iterateValue;
                                    $(child).attr('iterate', iterateValue);
                                }

                                j++;
                            }
                        }


                        i++;
                    }


                    /*                    _.each($html.find('[iterate]'), function(iteratee) {
                     var children = $(iteratee).find('[iterate]');
                     if (children.length>0) {
                     _.each(children, function(child) {
                     var iterateValue = $(child).attr('iterate');
                     if (iterateValue.indexOf('element.')==-1) {
                     iterateValue = 'element.' + iterateValue;
                     $(child).attr('iterate', iterateValue);
                     }

                     });
                     }
                     });*/


                    var itArr = $html.find('[iterate]');

                    for (var j=0; j<itArr.length; j++) {

                        itArr = $html.find('[iterate]');

                        var iteratee = itArr[j];

                        var arrayName = $(iteratee).attr('iterate');


                        $(iteratee).before('{= _.each(' + arrayName + ', function(element)  {  =}');
                        //$(iteratee).parent().prepend('{= _.each(' + arrayName + ', function(element)  {  =}');

                        //$(iteratee).parent().append('{=  } );  =}');
                        $(iteratee).after('{=  } );  =}');


                        content = $(iteratee).html();

                        var pattern = new RegExp('{{([a-zA-Z\\d ,._ 0-9 \\[ \\]]+)}}', 'g');
                        var replacer = '{{element.$1}}';
                        var arrayPattern = new RegExp('\\[\\[([0-9]+)\\]\\]', 'g');
                        var arrayReplacer = '{{element[$1]}}';

                        if (content.indexOf('{{element.')==-1) {
                            $(iteratee).html(Util.trim(content.replace(pattern, replacer)));
                        }

                        content = $(iteratee).html();

                        if (content.indexOf('{{element.')==-1) {
                            $(iteratee).html(Util.trim(content.replace(arrayPattern, arrayReplacer)));
                        }

                        $.each(iteratee.attributes, function (i, attrib) {
                            var value = $(iteratee).attr(attrib.name);

                            var mustacheReplacement = Util.trim(value.replace(pattern, replacer));

                            if (value == mustacheReplacement) {
                                //unsuccessful replacment, try to replace it with the array pattern
                                value = Util.trim(value.replace(arrayPattern, arrayReplacer));
                            } else {
                                //use the replaced value
                                value = mustacheReplacement;
                            }

                            $(iteratee).attr(attrib.name, value)


                        });


                    }



                    workaround = $html.html();

                    workaround = workaround.replace(/__wtf__/g,'src');



                    if (templateOptions.webservice !== undefined) {

                        //TODO Use a promise api and execute call for the template and the data in parallel and refactor this render method..
                        context.ajaxRequest({
                            url: templateOptions.webservice,
                            data: templateOptions.params,
                            type: templateOptions.type,
                            dataType: "json",
                            error: templateOptions.error,
                            saveAs: templateOptions.saveAs,
                            saveFrom: templateOptions.saveFrom,
                            success: function (json) {
                                //TODO outerHTML will work only in modern browsers , the other workaround is $('<div>').append($('#item-of-interest').clone()).html();


                                if (templateOptions.serviceCallback !== undefined) {
                                    json = templateOptions.serviceCallback.call(templateOptions.context,json)
                                }



                                var content = _.template(workaround, json)




                                //TODO shoudnt we always append !?!?!?!
                                if (templateOptions.append == undefined) {
                                    templateOptions.el.html(content)
                                } else if (templateOptions.append == true){
                                    templateOptions.el.append(content)
                                }  else if (templateOptions.prepend == true){
                                    templateOptions.el.prepend(content)
                                }

                                if (templateOptions.renderCallback !== undefined) {

                                    templateOptions.renderCallback.call(templateOptions.context);
                                }

                                //Patch for nested widgets in a widget
                                Backbone.constructor.createWidgetsInEl($(templateOptions.el))

                                deffered.resolve();


                            }
                        })
                    } else {
                        //TODO outerHTML will work only in modern browsers , the other workaround is $('<div>').append($('#item-of-interest').clone()).html();

                        var content = null;


                        if (templateOptions.data == undefined) {
                            content = _.template(workaround);
                        } else {
                            //TODO prevent images being loaded before replacement
                            content = _.template(workaround, templateOptions.data);
                        }

                        //TODO shoudnt we always append !?!?!?!
                        if (templateOptions.append == undefined) {
                            templateOptions.el.html(content)
                        } else {
                            templateOptions.el.append(content)

                        }

                        if (templateOptions.renderCallback !== undefined) {
                            templateOptions.renderCallback.apply(templateOptions.context);
                        }



                        //Patch for nested widgets in a widget
                        Backbone.constructor.createWidgetsInEl($(templateOptions.el))
                        deffered.resolve();


                    }


                }
                return deffered.promise;
            }

        /**
         * Stores the data returned from the last successful ajax request
         */
        this.response = null;


        this.call = function (options) {


            if (options.template !== undefined) {
                options.asset = options.template;
                if (options.dataType === undefined) {
                    options.dataType = 'html'
                }
            }

            if (options.asset === undefined) {
                options.preloaderGuid = this.addPreloader();
            }


            if (options.params !== undefined) {
                options.data = options.params
            }

            if (options.type === undefined) {
                options.type = 'POST';
            }

            if (options.dataType === undefined) {
                options.dataType = "json"
            }

            if (options.context == undefined) {
                options.context = this;
            }


            if (options.path !== undefined) {
                options.url = this.path(options.path)
            }


            if (options.asset !== undefined) {

                options.url = this.assetsFolder() + options.asset
            }


            if (options.data == undefined) {
                options.data = {}
            }



            //if (this.readCookie('sid') !== undefined) {
            //    _.extend(options.data, { sid: this.readCookie('sid')});
            //}

            _.extend(options.data, {sid: Backbone.session.sessionId});

            /**
             * This params are added so the browser will not cache catalog data for other currency , soldto etc.
             *
             */


            if (Backbone.session !== undefined && Backbone.session.bpId !== undefined) {
                _.extend(options.data, { bpId: Backbone.session.bpId});
            }

            if (Backbone.session !== undefined && Backbone.session.shopId !== undefined) {
                _.extend(options.data, { shopId: Backbone.session.shopId});
            }

            if (Backbone.session !== undefined && Backbone.session.language !== undefined) {
                _.extend(options.data, { lang: Backbone.session.language});
            }

            if (Backbone.session !== undefined && Backbone.session.currency !== undefined) {
                _.extend(options.data, { cur: Backbone.session.currency});
            }

            if( this.widgetPath != undefined ){
                options.url = this.widgetPath + options.url;
            }

            var ajaxRequest = $.ajax(options);


            if (typeof  options.cancelable !== 'undefined' && options.cancelable === true) {
                Backbone.cancelableRequests.push(ajaxRequest);
            }


            var deferred = when.defer();

            var promise = deferred.promise

            promise.ensure(function () {


                options.context.removePreloader(options.preloaderGuid);

            });


            ajaxRequest.then(function (successData) {


                if (successData.status !== undefined && successData.status === 'error') {

                    if (successData.data == "invalid.session" || successData.data=="not.logged") {
                        options.context.alert({
                            type: 'danger',
                            title: 'Webservice ' + options.url + ' error:',
                            message:  'Your session is expired, please login again!',
                            redirect: true
                        });

                    }else{
                        // prevent default alert message with setting alert to false
                        if (options.alert != false) {
                            promise.otherwise(function (data) {

                                options.context.alert({
                                    type: 'danger',
                                    title: 'Webservice ' + options.url + ' error:',
                                    message:  data
                                });

                            });

                        }
                    }







                    deferred.reject(successData.data)
                } else {
                    if (successData.data !== undefined) {
                        deferred.resolve(successData.data)
                    } else {
                        deferred.resolve(successData)
                    }

                }


            }, function (errorData) {
                promise.otherwise(function (data) {
                    if (data.status != 0) {
                        options.context.alert({
                            type: 'danger',
                            title: 'Webservice ' + options.url + ' error:',
                            message:  'Server responded with ' + data.status + ' ' + data.statusText
                        })
                    }

                })

                deferred.reject(errorData)


            })


            return promise


        }
        /**
         * success -> callback to be executed when the webservice returns ok status
         * error -> callback to be executed when the webservice returns error status ( if none is provide we aregoing to display a bootstrap alert containing the data of the error )
         * httpError -> callback to be executed if you want to handle 404 or other errors
         * asset -> used to load resource from the asset folder - it is translated to url
         * url -> the url to load the resource from
         * path -> it get's translated to url if the path for the widget is configured
         * context -> the context of execution of the callback functions success and error
         * saveTo -> stores the response from the ajax request as a local parameter. Keep in mind that if we are using the res.status & res.data protocol the saved responsw will be res.data if saveFrom is not specified
         * saveFrom -> if we like to store only a specific property from the response we can describe it here in a dot notation like data.users.nasko
         * @param options
         * @param context
         */



        this.ajaxRequest = function (options) {
            //TODO Clean the new ui for production


            options.preloaderGuid = this.addPreloader();


            if (options.timeout === undefined) {
                options.timeout = Backbone.timeout;
            }

            if (options.params !== undefined) {
                options.data = options.params
            }

            if (options.type === undefined) {
                options.type = "POST"
            }

            if (options.dataType === undefined) {
                options.dataType = "json"
            }

            if (options.context == undefined) {
                options.context = this;
            }


            if (options.path !== undefined) {
                options.url = this.path(options.path)
            }


            if (options.asset !== undefined) {

                options.url = this.assetsFolder() + options.asset
            }


            if (options.data == undefined) {
                options.data = {}
            }

            /**
             * This params are added so the browser will not cache catalog data for other currency , soldto etc.
             */


            if (Backbone.session !== undefined && Backbone.session.bpId !== undefined) {
                _.extend(options.data, { bpId: Backbone.session.bpId});
            }

            if (Backbone.session !== undefined && Backbone.session.shopId !== undefined) {
                _.extend(options.data, { shopId: Backbone.session.shopId});
            }

            if (Backbone.session !== undefined && Backbone.session.language !== undefined) {
                _.extend(options.data, { lang: Backbone.session.language});
            }

            if (Backbone.session !== undefined && Backbone.session.currency !== undefined) {
                _.extend(options.data, { cur: Backbone.session.currency});
            }




            //if (this.readCookie('sid') !== undefined) {
            //    _.extend(options.data, { sid: this.readCookie('sid')});
            //}

            if (Backbone.session.sessionId!=undefined) {
                _.extend(options.data, {sid: Backbone.session.sessionId});
            }


            var success = options.success;


            if (options.error == undefined) {
                //If there is no default error handler
                //create one

                options.error = function (data) {

                    var message = null;

                    if (data.data == undefined) {
                        // If the response is not according to the json protocol
                        // create a message with the http error code and status text
                        message = 'Server responded with ' + data.status + ' ' + data.statusText
                    } else {
                        // else use the error message from the webservice
                        message = data.data

                    }

                    if(message == "invalid.session" || message=="not.logged"){
                        this.alert({
                            type: 'danger',
                            title: 'Webservice ' + options.url + ' error:',
                            message:  'Your session is expired, please login again!',
                            redirect: true
                        });
                    }else{
                        this.alert({
                            type: 'danger',
                            title: 'Webservice ' + options.url + ' error:',
                            message: message
                        })
                    }





                }

            } else {

                // If there is an error handler in the ajaxRequest collect the right message and pass it to the error callback
                var error = options.error

                options.error = function (data) {

                    var message = null;

                    if (data.status !== undefined && data.statusText !== undefined) {
                        message = 'Server responded with ' + data.status + ' ' + data.statusText
                    } else {
                        message = data
                    }

                    error.call(options.context, message)

                }
            }

            options.success = function (data) {


                var storeFrom = null;

                if (data.data !== undefined) {
                    storeFrom = 'data.'
                    toStore = data.data
                } else {
                    storeFrom = ''
                    toStore = data;
                }


                if (options.saveAs !== undefined) {


                    var saveAs = options.saveAs


                    if (options.saveFrom !== undefined) {

                        storeFrom += options.saveFrom

                        this[saveAs] = Util.getPropByString(toStore, storeFrom)


                    } else {
                        this[saveAs] = toStore;
                    }
                }


                if (data.status == "error") {


                    options.error.call(options.context, data);


                }


                // We _will_ call the success callback if the data has no status, as the standard ajax call
                if (status !== undefined && data.status !== 'error' && success!=undefined) {
                    success.call(options.context, toStore);
                }


            };



            if( this.widgetPath != undefined ){
                options.url = this.widgetPath + options.url;
            }


            var request = $.ajax(options);

            if (typeof  options.cancelable !== 'undefined' && options.cancelable === true) {
                Backbone.cancelableRequests.push(request);
            }

            request.always(function () {
                options.context.removePreloader(options.preloaderGuid);
            });

            return request;


        }

        this.request = function () {

            Backbone.request = {};
            var locationHash = window.location.hash;
            if (locationHash!=undefined && locationHash!='') {
                var parameters = locationHash.split('/')[1];

                if (parameters!=undefined) {
                    var paramArray = parameters.split('&');
                    _.each(paramArray, function (param) {
                        var paramArr = param.split('=');
                        var paramObject = '{"' + paramArr[0] + '":"' + paramArr[1] + '"}';
                        $.extend(Backbone.request, jQuery.parseJSON(paramObject));
                    });
                }
            }

            return Backbone.request;
        }


        this.setSession = function (session) {

            if (session !== undefined) {
                Backbone.session = session;
            }

            return Backbone.session;

        }

        this.getSession = function () {


            return Backbone.session;

        }


        this.addPreloader = function () {

            Backbone.preloaderCounter += 1;

            if (Backbone.preloaderCounter > 5) {
                Backbone.preloaderCounter = 0;
            }


            var guid = Util.guid();

            var $preloaderDiv = $("<div>", {
                "id": guid,
                "class": 'linearPreloader preloader' + Backbone.preloaderCounter

            });


            $('#preloader').append($preloaderDiv);


            $preloaderDiv.animate({

                    'width': '100%'
                },
                {
                    duration: Backbone.timeout,
                    progress: function (animation) {


                        if ($preloaderDiv.hasClass('loaded')) {
                            $preloaderDiv.removeClass('loaded')

                            animation.duration = animation.duration / 100


                        }
                    },
                    complete: function () {

                        $preloaderDiv.fadeOut('fast', function () {
                            $preloaderDiv.remove();
                        });

                    }


                })


            //Uncomment this if we want triangle with loading text

//            if(this.$el !== undefined) {
//
//
//                var $triangleContainer = $("<div class='preloader'>" )
//
//
//
//
//                var $preloaderTriangle = $("<div>", {
//
//                    "class": 'trianglePreloader preloader' + Backbone.preloaderCounter
//
//                });
//                $triangleContainer.append($preloaderTriangle)
//
//                $triangleContainer.append('<span class=" preloader'+Backbone.preloaderCounter+' preloaderText'+'">loading...</span>');
//
//                this.$el.append($triangleContainer);
//
//                function fade() {
//                    $preloaderTriangle.fadeTo( "slow" , 0.5, function() {
//                        $preloaderTriangle.fadeTo( "slow" , 1, fade)
//                    });
//                }
//
//                fade()
//
//
//
//            }


            return guid;
        }

        this.removePreloader = function (preloaderGuid) {
            $('#' + preloaderGuid).addClass('loaded')

            if (this.$el != undefined) {
                this.$el.find('.trianglePreloader').parent().remove();

            }

            if (Backbone.preloaderCounter != 0) {
                Backbone.preloaderCounter -= 1;


                if (Backbone.preloaderCounter == 0) {
                    this.fire('LAST_PRELOADER_FINISHED')
                } else {
                    this.fire('PRELOADER_FINISHED')
                }


            }


        }


        this.deleteCookie = function (cookieName) {
            this.setCookie(cookieName, undefined, { expires: 1});
        }  ,

        /**
         * Options can be
         * path: A string value of the path of the cookie
         domain: A string value of the domain of the cookie
         expires: A number (of seconds), a date parsable string, or a Date object of when the cookie will expire
         secure: A boolean value of whether or not the cookie should only be available over SSL
         */
            this.setCookie = function (cookieName, cookieValue, options) {
                Cookies.set(cookieName, cookieValue, options)
            }


        /**
         * Reads cookie
         * @param cookieName
         * @returns {*}
         */
        this.readCookie = function (cookieName) {
            return  Cookies.get(cookieName)
        }

        this.validateInput = function (String_element, String_type) {

            var string = $(String_element).val();
            switch (String_type) {
                case 'text':
                    if (string.length > 1) {
                        return true;
                    }
                    break;
                case 'warning':
                    $(targetElement).find('.alert').addClass('alert-block');
                    break;
                case 'success':
                    $(targetElement).find('.alert').addClass('alert-success');
                    break;
                default:
                    $(targetElement).find('.alert').addClass('alert-info');
            }

        }

        /**
         *
         * @param locaton  the requested path
         * @param comment
         * @returns {Location|String} the requested path if configured or the location as passed
         */
        this.path = function (location) {
            if (this.options.paths !== undefined) {


                var p = _.findWhere(this.options.paths, {name: location})

                if (p == undefined) {
                    return location;
                } else {
                    return p.url;
                }

            } else {
                return location;
            }
        }

        this.navigate = function (location) {
            //if we have routes
            if (this.options !== undefined && this.options.routes !== undefined) {


                //search for the mandatoryCharacteristic route

                var route = _.findWhere(this.options.routes, {name: location})
//                "action": "alert|layout|modal|modallayout",
                if (route != undefined) {
                    switch (route.action) {
                        case 'alert':
                            this.alert({
                                message: route.value
                            })
                            break;
                        case 'changeLayout':
                            Backbone.router.navigate(route.value, true)
                            break;
                        case 'modal':
                            break;
                        case 'modallayout':
                            break;


                    }
                }
            }
            /**
             *  targetElement -> Optional giving a specific element for alert message
             *  String_title -> Title for the alert message
             *  String_message -> The message displayed in the alert
             *  String_type -> According to the type the css of the alert is different
             *  Boolean_autohide -> By default alert auto derived is enabled
             *  Int_duration -> Duration of the time alert is being displayed
             */
        }, this.alert = function (options) {


            if (options.message == "Your session is expired, please login again!") {

                if (window.redirectingToHome==undefined) {
                    alert('Your session is expired, please login again!');
                    window.location = "";
                    window.location.reload();
                }
                window.redirectingToHome = true;
                return;
            }

            if (options == undefined || options == null) {
                options = {};
            }

            // Default values
            var targetElement = 'body';
            var String_title = 'Info: ';
            var String_message = 'No message to display';
            var String_type = 'info';
            var Boolean_autohide = true;
            var Int_duration = 300000;
            if (options.duration!=undefined) {
                Int_duration =  options.duration;
            }
            var redirect = false;

            if (options.redirect != undefined && options.redirect != null) {
                redirect = options.redirect;
            }

            if (options.el != undefined && options.el != null) {
                targetElement = options.el;
            }
            if (options.title != undefined && options.title != null) {
                String_title = options.title + "  :  ";
            }
            if (options.message != undefined && options.message != null) {
                String_message = options.message;
            }

            if (options.type == undefined) {
                options.type = 'info';
            }
            if (options.type != null) {
                String_type = options.type;
            }
            if (options.autohide != undefined && options.autohide != null) {
                Boolean_autohide = options.autohide;
            }
            if (options.duration != undefined && options.duration != null) {
                Int_duration = options.duration;
            }


            var $alertContainer = null;
            // If there is no alert container create one
            if ($('#alertContainer').length == 0) {
                $alertContainer = $("<div>", {
                    "id": "alertContainer",
                    "class": "alert-container"
                });
            } else {
                $alertContainer = $('#alertContainer');
            }

            // Create alert
            var $alert = $("<div>", {
                "class": "alert"
            });
            // Append Title, message and close button to the alert
            var alertInnerHtml = "<button id='alert_button' type='button' class='close' data-dismiss='alert'>×</button><strong>" + String_title + "</strong>" + String_message;
            $alert.append(alertInnerHtml);
            // Append the alert to the alert container
            $alertContainer.append($alert);
            $(targetElement).prepend($alertContainer);

            // Define the alert style according to the alert type
            $(targetElement).find('.alert').addClass('alert-' + String_type);

            // Hide the alert after a period of time -> Int_duration
            if (Boolean_autohide == true) {
                window.setTimeout(function () {
                    $alert.fadeOut('normal', function () {
                        $alert.remove();
                        if ($alertContainer.find('.alerts').length == 0) {
                            $alertContainer.remove();
                        }
                        if(redirect){
                            //If we are on the login page already
                            if(Backbone.history.fragment == ''){
                                //location.reload();
                            }else{
                                //Backbone.router.navigate('', true);
                                window.location = "";
                            }

                        }
                    });
                }, Int_duration);
            } else {
                // If the autohide is set to false add a click handler
                $alert.find('#alert_button').on('click', function () {
                    $alert.remove();
                    if(redirect){
                        if(Backbone.history.fragment == ''){
                            location.reload();
                        }else{
                            Backbone.router.navigate('', true);
                        }
                    }
                })
            }

            // Showing the alert with fade-in animation
            $alert.fadeIn();

        }
        this.zeroFill = function(n, width, z){
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        this.put = function (key, value) {
            if (this.store === undefined) {
                alert('you cannot use local store, please use a modern browser')

            } else {
                this.store.setItem(key, JSON.stringify(value))
            }
        }

        this.get = function (key) {


            if (this.store === undefined) {
                alert('you cannot use local store, please use a modern browser')
//
            } else {
                return   JSON.parse(this.store.getItem(key))
            }


        },

        /**
         *
         * @param nomenclature as String
         * @returns {Array} with breadcrumb values to display
         */
        this.getBreadcrumbs = function( nom , callback ){
            var breadcrumbs = [];
            this.ajaxRequest({

                url: "nomenclature/getAllTypes.ws",
                type: "GET",
                success: function (nomTypes) {
                    var nomenclatureLength = 0;
                    _.each(nomTypes, function( ntype ){
                        nomenclatureLength += ntype.width;
                    });

                    var fillWithStars = function(nomenclature, nLength) {

                        for (var i = nomenclature.length; i < nLength; i++) {
                            nomenclature += '#';
                        }
                        return nomenclature;
                    }



                    this.ajaxRequest({
                        url: "nomenclature/readTree.ws",
                        type: "GET",
                        success: function (tree) {

                            var flatMap = [];

                            var branch = function(tree) {

                                tree.value = tree.data.value;
                                tree.fullKey = tree.data.fullKey;

                                flatMap.push(tree);
                                _.each(tree.children, function(child) {
                                    child.value = child.data.value;
                                    flatMap.push(child);
                                    if (child.children) {
                                        branch(child);
                                    }
                                }, this)
                            }


                            _.each(tree, function(node) {
                                branch(node);
                            });




                            var nomSlice='',
                                from = 0, to = 0;

                            _.each(nomTypes, function( ntype ){

                                to = from + ntype.width;

                                var crumb = {};

                                nomSlice += nom.slice(from, to);

                                crumb.key = nom.slice(from, to);
                                crumb.nomenclature = fillWithStars(nomSlice, nomenclatureLength);
                                crumb.name = undefined;

                                var found = _.findWhere(flatMap, {"value":crumb.key, "fullKey":crumb.nomenclature});

                                if (found) {
                                    crumb.name = found.data.name;
                                }

                                crumb.label = ntype.description;
                                if( crumb.name != undefined ){
                                    breadcrumbs.push(crumb);
                                }

                                from += ntype.width;
                            }, this);


                            if (callback) {
                                callback();
                            }


                        }
                    });


                }

            });

            return breadcrumbs;

        }

    }


    return new Renderer();


});

