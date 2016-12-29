define(function () {
    function t() {
        this.mixin = function (t, n) {
            for (var i in n)n.hasOwnProperty(i) && (t[i] = n[i]);
            return t
        }, this.mixinRecursive = function t(n, i) {
            for (var r in i)i.hasOwnProperty(r) && (_.isUndefined(n[r]) || _.isUndefined(i[r]) || "[object Object]" != i[r].toString() || "[object Object]" != n[r].toString() ? "function" == typeof i[r] && "function" == typeof n[r] && n[r].name == i[r].name ? (i[r].prototype = {$super: n[r]}, n[r] = i[r]) : n[r] = i[r] : n[r] = t(n[r], i[r]));
            return n
        }, this.trim = function (t) {
            for (var n = 0, i = t.length - 1; i >= n && t.charCodeAt(n) < 33;)++n;
            for (; i > n && t.charCodeAt(i) < 33;)--i;
            return t.substr(n, i - n + 1)
        }, this.removeCidFromWidget = function (t, n) {
            this.removeCidAsAttribute(t, n, "id")
        }, this.appendCidToWidget = function (t, n) {
            this.appendCidAsAttribute(t, n, "id")
        }, this.removeCidFromContainer = function (t, n) {
            this.removeCidAsAttribute(t, n, "widgetIds")
        }, this.appendCidToContainer = function (t, n) {
            this.appendCidAsAttribute(t, n, "widgetIds")
        }, this.serializeFormAsObject = function (t) {
            for (var n = t.serializeArray(), i = {}, r = 0; r < n.length; r++) {
                var e = n[r];
                i[e.name] = e.value
            }
            return i
        }, this.appendCidAsAttribute = function (t, n, i) {
            var r = n.attr(i);
            void 0 != r || (r = t), n.attr(i, r)
        }, this.removeCidAsAttribute = function (t, n, i) {
            var r = n.attr(i);
            r = r.replace("," + t, ""), r = r.replace(t, ""), n.attr(i, r)
        }, this.guid = "undefined" != typeof window.crypto && "undefined" != typeof window.crypto.getRandomValues ? function () {
                var t = new Uint16Array(8);
                window.crypto.getRandomValues(t);
                var n = function (t) {
                    for (var n = t.toString(16); n.length < 4;)n = "0" + n;
                    return n
                };
                return n(t[0]) + n(t[1]) + n(t[2]) + n(t[3]) + n(t[4]) + n(t[5]) + n(t[6]) + n(t[7])
            } : function () {
                var t = (new Date).getTime(), n = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (n) {
                    var i = (t + 16 * Math.random()) % 16 | 0;
                    return t = Math.floor(t / 16), ("x" == n ? i : 7 & i | 8).toString(16)
                });
                return n
            }, this.hideContentForGroups = function (t, n) {
            return $(t).find("[groups]").each(function () {
                if (n.indexOf($(this).attr("groups")) < 0) {
                    var i = $(this).attr("groups"), r = $("<div/>");
                    r.html(t), r.find("[groups=" + i + "]").addClass("hidden"), t = r.html(), t = $("<textarea />").html(t).val()
                }
            }), t
        }, this.getPropByString = function (t, n) {
            if (!n)return t;
            for (var i, r = n.split("."), e = 0, o = r.length - 1; o > e && (i = r[e], "object" == typeof t && null !== t && i in t); e++)t = t[i];
            return t[r[e]]
        }
    }

    return new t
});