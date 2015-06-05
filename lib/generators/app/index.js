var yeoman = require('yeoman-generator'),
    schinquirer = require("schinquirer"),
    npmName = require('npm-name'),
    mkdirp = require("mkdirp"),
    path = require("path"),
    async = require("async"),
    moment = require("moment");

module.exports = yeoman.generators.Base.extend({
    init: function () {
        this.currentYear = (new Date()).getFullYear();
        this.moment = moment();
        this.log(
            this.yeoman +
            '\nThe name of your project shouldn\'t contain "node" or "js" and' +
            '\nshould be a unique ID not already in use at npmjs.org.'
        );
    },
    askForModuleName: function () {
        var done = this.async();

        schinquirer
            .prompt({
                name: {
                    type: "string",
                    message: "Module name",
                    pattern: "^[a-z0-9][a-z0-9\._\-]*$",
                    maxLength: 214,
                    minLength: 1,
                    default: path.basename(process.cwd())
                },
                pkgName: {
                    type: "boolean",
                    message: 'The name above already exists on npm, choose another?',
                    default: true,
                    when: function(answers) {
                        var done = this.async();

                        npmName(answers.name, function (err, available) {
                            if (!available) {
                                done(true);
                                return;
                            }

                            done(false);
                        });
                    }
                }
            })
            .then(function(props) {
                if (props.pkgName) {
                    return this.askForModuleName();
                }

                this.slugname = props.name;
                this.safeSlugname = this.slugname.replace(/-+([a-zA-Z0-9])/g, function (g) {
                    return g[1].toUpperCase();
                });

                done();
            }.bind(this), done);
    },

    askFor: function() {
        var cb = this.async();

        schinquirer
            .prompt({
                description: {
                    type: "string",
                    message: 'What is your module about?'
                },
                keywords: {
                    type: "string",
                    message: 'Key your keywords (comma to split)?'
                },
                authorName: {
                    type: "string",
                    message: "Whats your name?",
                    default: this.config.get("authorName")
                },
                authorEmail: {
                    type: "string",
                    format: "email",
                    message: "Whats your email?",
                    default: this.config.get("authorEmail")
                },
                authorUrl: {
                    type: "string",
                    format: "uri",
                    message: "Whats your site?",
                    default: this.config.get("authorUrl")
                },
                githubUsername: {
                    type: "string",
                    message: 'What is your GitHub username?',
                    default: this.config.get("githubUsername")
                },
                license: {
                    type: "string",
                    message: "Licence",
                    default: "MIT"
                }
            })
            .then(function(props) {
                this.props = props;
                this.keywords = props.keywords
                    ? props.keywords.split(',').map(function (el) { return el.trim(); })
                    : [];

                ["authorName", "authorEmail", "authorUrl", "githubUsername"].forEach(function (key) {
                    var value;

                    if ((value = props[key]) !== void 0) {
                        this.config.set(key, value);
                    }
                }.bind(this));

                if (props.githubUsername) {
                    this.repoUrl = props.githubUsername + '/' + this.slugname;
                } else {
                    this.repoUrl = 'user/repo';
                }

                cb();
            }.bind(this), cb);
    },

    app: function () {
        this.template('gitignore.ejs', '.gitignore');
        this.template('jshintrc.ejs',  '.jshintrc');
        this.template('package.ejs',   'package.json');
        this.template('index.ejs',     'index.js');
        this.template('changelog.ejs', 'CHANGELOG.md');
        this.template('readme.ejs',    'README.md');
        this.template('travis.ejs',    '.travis.yml');
    },

    projectfiles: function () {
        var cb = this.async();

        async.series(
            [
                async.apply(mkdirp, './test'),
                async.apply(mkdirp, './lib'),
                function(next) {
                    this.template('./test/test.ejs', './test/test.js');
                    next();
                }.bind(this)
            ],
            cb
        );
    }
});