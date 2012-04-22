![MODIVLE source](http://dl.dropbox.com/u/24733998/modivleblack.png)

Application hosted here [modivle](http://modivle.yrmichael.com)

Feedback, contributions very welcome!

## Setting up the development environment

You'll need **Redis** installed. Details at http://redis.io/download

Next, run ```npm install``` which will use npm to install all the dependencies.
Depending on your configuration, you might need to export the installed modules to your path.

When you make changes, you can update the project using the makefile. (```make all```)

Finally, executing the app:

```bash
# you need to run redis first.

# Development mode
$ node app.js

# Production mode
$ export NODE_ENV=production 
$ node app.js
```

## Contributing

modivle uses [jshint](https://github.com/jshint/jshint/) for validation of js.

please validate changes by doing:

```sh
make jshint
```