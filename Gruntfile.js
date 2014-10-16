module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha: {
      test: {
        src: ['spec/*.html'],
        dest: 'log/test.log',
        options: {
          reporter: 'Nyan',
        }
      },
    },  
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/lib/main.js', 'src/lib/class.js', 'src/lib/chart.js', 'src/core/*.js'],
        dest: 'dist/viz.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/viz.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('default', ['concat', 'uglify']);
};