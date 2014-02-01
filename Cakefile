# Require
fs = require "fs"
flour = require "flour"
rmdir = require "rimraf"

# Name and version taken from package
config = require('./package.json')

# Prepend files with info comments
prepend = """// #{config.name} - v#{config.version} - #{config.license}
             // #{config.description}
             // #{config.repository.url}\n"""

# Bare coffeescript
flour.compilers.coffee.bare = true

# Update bower.json, to match package.json
# Using npm version will therefore update bower
task "build:bower", ->
  bower.version = config.version
  fs.writeFile "bower.json", JSON.stringify(bower, null, 2) + "\n"

# Remove directory, compile and uglify js
task "build", ->
  rmdir "build", (err) ->
    if err
      console.log(err)
    else
      compile "src/#{config.name}.coffee", "build/#{config.name}.js", (res) ->
        fs.writeFile "build/#{config.name}.js", prepend + res
        invoke "minify"

# Take js and uglify it
task "minify", ->
  minify "build/#{config.name}.js", "build/#{config.name}.min.js", (res) ->
    fs.writeFile "build/#{config.name}.min.js", prepend + res

# Watch for changes
task "watch", ->
  invoke "build"
  watch "src/#{config.name}.coffee", -> invoke "build"

# Lint js
task "lint", "Check javascript syntax", ->
  lint "build/#{config.name}.js"
