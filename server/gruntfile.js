module.exports = function(grunt) {
  grunt.initConfig({
    concurrent: {
      dev: {
        tasks: ["nodemon", "watch"],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    clean: {
      build: ['dist']
    },
    ts: {
      default : {
        src: ["**/*.ts", "!node_modules/**"],
        tsconfig: true
      },
      options : {
        fast: "never"
      }
    },
    tslint: {
      options: {
          // can be a configuration object or a filepath to tslint.json
          configuration: "tslint.json",
          // If set to true, tslint errors will be reported, but not fail the task
          // If set to false, tslint errors will be reported, and the task will fail
          force: true,
          fix: false
      },
      files: {
          src: ["**/*.ts", "!node_modules/**"]
        }
      },
    watch: {
       files: "**/*.ts",
       tasks: ["ts", "tslint"]
    },
    nodemon: {
      dev: {
        script: "dist/app.js",
        options: {
         args: ["dev"],
         nodeArgs: ["--debug"],
         cwd: __dirname,
         ignore: ["node_modules/**"],
         ext: "js",
         watch: ["dist"],
         delay: 1000,
         legacyWatch: true
       }
      }
     }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-clean")
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-nodemon");
  grunt.registerTask("default", ["clean", "ts", "tslint", "concurrent"]);
};
