fs     = require "fs"
pug    = require "pug"
coffee = require "coffeescript"
uglify = require "uglify-js"

# Name and version taken from package
config = require('./package.json')
bower  = require('./bower.json')

transpiler = presets: ["es2015-allow-top-level-this"]

# Prepend files with info comments
prepend = """/* #{config.name} - v#{config.version} - #{config.license} */
             /* #{config.description} */
             /* #{config.repository.url} */\n"""

# Build the demo html
task "build:demo", ->
  res = pug.renderFile("demo/index.pug", {config})
  fs.writeFileSync "demo/index.html", res

# Update bower.json, to match package.json
# Using npm version will therefore update bower
task "build:bower", ->
  bower.version = config.version
  fs.writeFileSync "bower.json", JSON.stringify(bower, null, 2)

# Remove directory, compile and uglify js
task "build:src", ->
  src = fs.readFileSync("./src/iostap.coffee").toString()
  res = coffee.compile(src, { bare: true, transpile: transpiler })
  min = uglify.minify(res)

  console.error(min.error) if min.error

  fs.writeFileSync "build/#{config.name}.js", prepend + res
  fs.writeFileSync "build/#{config.name}.min.js", prepend + min.code

task "build", ->
  invoke "build:src"
  invoke "build:demo"
  invoke "build:bower"
