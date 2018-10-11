define(["jquery", "underscore", "when"], function ($, _, When) {
    return function Constructor(widgetConfig) {
        this.getAttributes = function (widget) {
            var $widget = $(widget);
            this.widgetPath = $("novartowidget").attr("base-path"), void 0 == this.widgetPath && (this.widgetPath = "");
            var widgetOptions = {
                css: $widget.attr("css"),
                clean: $widget.attr("clean"),
                src: this.widgetPath + $widget.attr("src"),
                widgetId: $widget.attr("widgetId"),
                el: widget
            };
            if (1 == window.isIeBellow9 && (widgetOptions.clean = void 0), void 0 === widgetOptions.src)return {
                errors: [{
                    errorMessage: "Cannot create this widget because ether attribute src , id or meta widgets folder is not defined! ",
                    el: widget
                }]
            };
            var routesDOM = $(widget).find("route"), routes = null;
            if (routesDOM.length > 0) {
                routes = _.map(routesDOM, function (t) {
                    $route = $(t);
                    var e = $route.attr("name"), i = $route.attr("action"), r = $route.attr("value");
                    return void 0 == e || void 0 == i || void 0 == r ? {
                            errorMessage: "wrong route configuration. missing attributes name or action or value",
                            el: t
                        } : {name: e, action: i, value: r}
                });
                var errors = _.filter(routes, function (t) {
                    return t.hasOwnProperty("errorMessage")
                });
                if (errors.length > 0)return {errors: errors}
            } else if (void 0 !== widgetConfig) {
                var a = _.findWhere(widgetConfig, {src: widgetOptions.src, widgetId: widgetOptions.widgetId});
                void 0 != a && (routes = a.routes)
            }
            null != routes && (widgetOptions.routes = routes);
            var pathsDOM = $(widget).find("path"), paths = null;
            if (pathsDOM.length > 0) paths = _.map(pathsDOM, function (t) {
                var e = $(t).attr("name"), i = $(t).attr("url");
                return void 0 == e || void 0 == i ? {
                        errorMessage: "wrong paths configuration. missing attributes name or url",
                        el: t
                    } : {name: e, url: i}
            }); else if (void 0 !== widgetConfig) {
                var a = _.findWhere(widgetConfig, {src: widgetOptions.src, widgetId: widgetOptions.widgetId});
                void 0 != a && (paths = a.paths)
            }
            null != paths && (widgetOptions.paths = paths), widgetOptions.config = {};
            var config = $(widget).attr("config");
            return null != config && $.ajax({
                async: !1,
                url: config,
                context: widgetOptions.config,
                success: function (data) {
                    ";" == data.charAt(data.length - 1) && (data = data.slice(0, data.length - 1)), widgetOptions.config = eval("(" + data + ")"), widgetOptions.config = widgetOptions.config()
                }
            }), widgetOptions
        }, this.createWidgets = function (t) {
            "undefined" == typeof t && (t = document), this.createWidgetsInEl($(t))
        }, this.createWidgetsInEl = function (t) {
            var e = t.find("widget").length;
            e > 0 && (logger.debug("Triggering OPEN_EVENT_BUFFER"), Backbone.EventBus.trigger("OPEN_EVENT_BUFFER"), Backbone.totalWidgets += t.find("widget").length, logger.debug("Constructor is increasing totalwidgets to ", Backbone.totalWidgets)), _.forEach(t.find("widget"), function (t) {
                var e = this.getAttributes(t);
                logger.debug("Creating " + e.src), void 0 != e.errors ? _.forEach(e.errors, function (t) {
                        $(t.el).css("border", "1px solid black"), $(t.el).css("color", "red"), $(t.el).css("padding", "0.2em"), $(t.el).html(t.errorMessage)
                    }) : "true" != $(t).attr("rendered") && (this.createWidget(e), $(t).attr("rendered", "true"))
            }, this)
        }, this.createWidget = function (t) {
            var e = _.findWhere(Backbone.views, {options: {clean: "false", src: t.src}});
            null == e || void 0 == e ? this.createWidgetInstance(t) : ($(t.el).html($(e.$el.children()[0]).remove()), e.setElement(t.el), e.options.el = t.el, $(e.options.el).attr("cid", e.cid), void 0 !== e.onReAttach && e.onReAttach(), Backbone.totalWidgets--, logger.debug(e.options.src + "is decreasing total widgets to " + Backbone.totalWidgets), 0 == Backbone.totalWidgets && (logger.debug("Total widgets count went to 0 , triggering ALL_WIDGETS_LOADED"), Backbone.EventBus.trigger("ALL_WIDGETS_LOADED")))
        }, this.createWidgetInstance = function (t) {
            var e = When.defer(), i = e.promise;
            return t.deffered = e, require([t.src], function (e) {
                var i = new e(t);
                i.listenFor("ALL_WIDGETS_LOADED", function () {
                    logger.debug("ALL_WIDGETS_LOADED RECEIVED", i.options.src), logger.debug("closing event buffers"), i.allWidgetsLoaded = !0, _.each(i.eventStack, function (t) {
                        logger.debug("poping event ", t.name), i.fire(t.name, t.data)
                    }), i.eventStack = []
                }), i.listenFor("OPEN_EVENT_BUFFER", function () {
                    i.allWidgetsLoaded = !1
                }), Backbone.totalWidgets--, 0 == Backbone.totalWidgets && Backbone.EventBus.trigger("ALL_WIDGETS_LOADED")
            }, function (t) {
                $('#reload-page').on('click', function(){
                    window.location = window.location.origin
                })
                $('#reloadPage').modal('show'), e.reject(t)
            }), i
        }
    }
});