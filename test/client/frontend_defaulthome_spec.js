//casper has a couple of prerequisites
// Mainly phantomjs 1.9.8
//See installation instructions: http://docs.casperjs.org/en/latest/installation.html
casper.test.begin('Sentia VerifyFront-End Content',1, function suite(test){

    casper.start('http://localhost:3000/', function() {
        test.assertTitle('Sentia - Enlightenment for your Environment', 'Sentia title is the one expected');

    });

    casper.run(function() {
              test.done();
    });
});