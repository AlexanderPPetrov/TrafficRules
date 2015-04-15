/* Copyright (C) renderer LTD - All Rights Reserved
 * Unauthorized copying or usage of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

({
    appDir: "../",
    baseUrl: "scripts",
    dir: "../../../../target/compiled_javascript/",
    urlArgs: 'v=15102014',
    modules: [
        {
            name: "multiPage"
        }

    ], paths: {
        'jquery': 'vendor/jquery/jquery',
        'jqueryui': 'vendor/jqueryui/jqueryui.min',
        'pathfinding': 'vendor/pathfinding/pathfinding',
        'animatesprite':"vendor/animatesprite/animatesprite",
        'underscore': 'vendor/lodash/lodash',
        'backbone': 'vendor/backbone-amd/backbone',
        'bootstrap': 'vendor/bootstrap/bootstrap',
        'text': 'vendor/requirejs-text/text',
        'json': 'vendor/requirejs-json/json',
        'util': 'vendor/renderer/util',
        'renderer': 'vendor/renderer/renderer',
        'augmentor': 'vendor/renderer/augmentor',
        'construct': 'vendor/renderer/constructor',
        'router': 'vendor/renderer/router',
        'cookies': 'vendor/cookies/cookies',
        'validation': 'vendor/validation/validation',
        'when': 'vendor/when/when' ,
        'when-sequenceAjax': 'vendor/when/sequenceAjax' ,
        'when-sequence': 'vendor/when/sequence' ,
        'when-pipeline': 'vendor/when/pipeline' ,
        'when-function': 'vendor/when/function' ,
        'typeahead': 'vendor/typeahead/typeahead' ,
        'datepicker': 'vendor/datepicker/js/bootstrap-datepicker',
        'fileupload': 'vendor/fileupload/fileupload',
        'bootstrapswitch': 'vendor/bootstrapswitch/bootstrapswitch',
        'bootstraptags': 'vendor/bootstraptags/bootstraptags',
        'select':'vendor/select/bootstrap-select',
        'datatables':'vendor/datatables/datatables',
        'datatables-editable': 'vendor/datatables/datatables.editable',
        'multiselect': 'vendor/multiselect/bootstrap-multiselect',
        'classie': 'vendor/notification-sidemenu/classie',
        'modernizr': 'vendor/notification-sidemenu/modernizr.custom',
        'dateformat': 'vendor/dateformat/dateformat',
        'hammer': 'vendor/hammer/hammer',
        'hammer-jq': 'vendor/hammer/jquery.hammer',
        'caret': 'vendor/caret/jquery.caret',
        'jquery-validation': 'vendor/validation/jquery.validate.min',
        'inplaceEdit': 'vendor/datatables/inplaceEdit',
        'bootstrap-dialog': 'vendor/bootstrap-dialog/bootstrap-dialog',
        'chart' : 'vendor/chartjs/Chart.min',
        'rangeSlider' : 'vendor/rangeSlider/range'

    },

    optimize: 'uglify',


    preserveLicenseComments: false
})
