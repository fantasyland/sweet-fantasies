require("shelljs/make")
var path = require("path")
var fs = require("fs")
var Mocha = require("mocha")

target.all = function() {
  target.clean()
  target.build()
  target.build_tests()
  target.test()
}

target.clean = function() {
  rm("build/*")
}

target.build = function() {
  if (!test('-d', 'build/')) {
    mkdir("build/")
  }
}

target.build_tests = function() {
  if (test('-f', "test.js")) {
    cat('macros.sjs', 'test.js').to('build/test.sjs')
    exec('sjs build/test.sjs --output build/test.js')
  }
}

target.test = function() {
  echo("\nrunning tests...")
  var mocha = new Mocha()

  fs.readdirSync('build/').filter(function(file) {
    return file.substr(-3) === '.js'
  }).forEach(function(file) {
    mocha.addFile(path.join("build/", file))
  })
  mocha.run()
}
