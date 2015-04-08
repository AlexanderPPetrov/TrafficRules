require({
        baseUrl: "./",
        paths: {
            "array": "src/array"
        }
    },
    ["require", "array"],
    function(require, array) {
        doh.register(
            "relativeModuleId",
            [
                function relativeModuleId(t){
                    t.is("src/array", array.name);
                    t.is("util", array.utilName);
                }
            ]
        );

        doh.run();
    }
);
