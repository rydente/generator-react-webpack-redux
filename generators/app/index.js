'use strict';
let generator = require('yeoman-generator');

module.exports = generator.Base.extend({

  constructor: function() {
    generator.Base.apply(this, arguments);

    this.option('skip-install');
  },

  install: function() {

    if(!this.options['skip-install']) {
      this.installDependencies({ bower: false });
    }

    // Run the base react-webpack generator, then run the dispatcher
    this.composeWith(
      'react-webpack',
      {
        options: {
          'skip-install': this.options['skip-install']
        }
      },
      {
        local: require.resolve('generator-react-webpack'),
        link: 'strong'
      }
    ).on('end', () => {
      var original = this.destinationPath('src/components/Main.js'),
        atomic = this.destinationPath('src/components/ecosystems/Main.js'),
        test = this.destinationPath('test/components/MainTest.js'),
        hypothesis = this.destinationPath('test/components/ecosystems/MainTest.js')

      // Run the create root method
      this.composeWith('atomic-react:root', {
        args: ['Root']
      });

      // Install redux and react bindings as requirement
      this.npmInstall(['redux', 'react-redux'], { save: true });

      // Move Main ecosystem and test
      this.fs.move(original, atomic)
      this.fs.move(test, hypothesis)

      // I know this is a horrible idea.  PRs welcome.
      // Relocate the Yeoman image in the main ecosystem component.
      this.fs.write(atomic,
        this.fs.read(atomic)
          .replace(/[.][.](?=\/images\/yeoman[.]png)/, '../..'))

      // Also reference the correct location of the Main ecosystem.
      this.fs.write(hypothesis,
        this.fs.read(hypothesis)
          .replace(/components(?=\/Main)/, 'components/ecosystems'))
    });
  }
});
