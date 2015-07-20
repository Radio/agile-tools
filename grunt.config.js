module.exports = {

    base: "/build/",

    webDir: "web",
    backendDir: "backend",

    buildDir: "build",
    buildBackendDir: "backend",

    packageDir: "package",

    backendFiles: {
        php: [
            "<%= backendDir %>/src/**/*",
            "<%= backendDir %>/vendor/**/*",
            "<%= backendDir %>/conf/*"
        ]
    },
    webFiles: {
        php: ["*.php"],
        js: ["assets/app/**/*.js"],
        apache: [".htaccess"],
        images: ["assets/app/img/**/*"],
        html: ["assets/app/templates/index.html"]
    },

    tpl: {
        files: "<%= webDir %>/assets/app/templates/**/*.html",
        jsFile: "<%= buildDir %>/assets/app/js/modules/templates.js",
        moduleName: "templates"
    },

    vendor: {
        files: {
            js: [
                "assets/bower/jquery/dist/jquery.min.js",
                "assets/bower/jquery-ui/jquery-ui.min.js",
                "assets/bower/bootstrap/dist/js/bootstrap.min.js",
                "assets/bower/pace/pace.min.js",
                "assets/bower/moment/min/moment.min.js",
                "assets/bower/momentjs-business/momentjs-business.js",
                "assets/bower/angular/angular.min.js",
                "assets/bower/angular-route/angular-route.min.js",
                "assets/bower/angular-route-segment/build/angular-route-segment.js",
                "assets/bower/angular-resource/angular-resource.min.js",
                "assets/bower/angular-local-storage/dist/angular-local-storage.min.js",
                "assets/bower/angular-sanitize/angular-sanitize.min.js",
                "assets/bower/chartjs/Chart.js",
                "assets/bower/js-yaml/dist/js-yaml.min.js",
                "assets/bower/angular-ui-sortable/sortable.js"
            ],
            css: [
                "assets/bower/bootstrap/dist/css/bootstrap.min.css",
                "assets/bower/pace/themes/blue/pace-theme-minimal.css"
            ],
            map: [
                "assets/bower/jquery/dist/jquery.min.map",
                "assets/bower/angular/angular.min.js.map",
                "assets/bower/angular-route/angular-route.min.js.map",
                "assets/bower/angular-resource/angular-resource.min.js.map",
                "assets/bower/angular-sanitize/angular-sanitize.min.js.map"
            ],
            fonts: [
                "assets/bower/bootstrap/dist/fonts/glyphicons-halflings-regular.*"
            ]
        }
    }
};