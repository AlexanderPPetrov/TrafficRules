require.config({paths:{jquery:"vendor/jquery/jquery",jqueryui:"vendor/jqueryui/jqueryui.min",pathfinding:"vendor/pathfinding/pathfinding",spritely:"vendor/spritely/spritely",underscore:"vendor/lodash/lodash",backbone:"vendor/backbone-amd/backbone",bootstrap:"vendor/bootstrap/bootstrap",text:"vendor/requirejs-text/text",json:"vendor/requirejs-json/json",util:"vendor/renderer/util",renderer:"vendor/renderer/renderer.min",augmentor:"vendor/renderer/augmentor",construct:"vendor/renderer/constructor",router:"vendor/renderer/router",cookies:"vendor/cookies/cookies",when:"vendor/when/when","when-sequenceAjax":"vendor/when/sequenceAjax","when-sequence":"vendor/when/sequence","when-pipeline":"vendor/when/pipeline","when-function":"vendor/when/function"},shim:{"hammer-jq":["hammer","jquery"],bootstrap:["jquery"],typeahead:["jquery"],caret:["jquery"],classie:["modernizr"],"datatables-editable":["jquery","jquery-validation","datatables","inplaceEdit"],"bootstrap-dialog":["jquery","bootstrap"],"bootstrap-datepicker":["jquery"]}}),define(["vendor/renderer/augmentor","router","jquery","vendor/requirejs/tests/circular/complexPlugin/slowText","bootstrap"],function(e,r,n){e();var o=(n("rendererwidget").attr("base-path"),{layout:!1});Backbone.router=new r(o);var t=n("css").attr("paths").split(",");_.each(t,function(e){n("head").append('<link href="'+e+'" rel="stylesheet" >')}),n("body").prepend('<div id="preloaderContainer"></div>')});