module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-jsmin-sourcemap');
    grunt.initConfig({
        'jsmin-sourcemap': {
            all: {
                src: ['js/common.js'],
                dest: 'js/common.jsmin-grunt.js',
                destMap: 'js/script.jsmin-grunt.js.map'
            }
        }
    });
    grunt.registerTask('default', 'jsmin-sourcemap');
};