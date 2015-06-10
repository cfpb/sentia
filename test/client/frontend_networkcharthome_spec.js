//casper has a couple of prerequisites
// Mainly phantomjs 1.9.8
//See installation instructions: http://docs.casperjs.org/en/latest/installation.html
casper.test.begin('Sentia Verify Front-End Network Chart Content',5, function suite(test){

    casper.start('http://localhost:3000/networkchart', function() {
      //let async javascript files a few seconds to load
        casper.wait(5000, function() {
            this.echo("I've waited for 5 seconds.");
        });
    });

    //now javascript files should be load , so we can test
    casper.then(function() {
        test.assert(this.exists('h2'), 'checking if h2 exists');
        test.assertEquals(this.fetchText('div.content-1 h2'), 'Chart Links',
            'h2 equals Chart Links');
        test.assert(this.exists('a.btn'),'checking if btn exists');
    });

    casper.then(function() {
        // Click on Typical Case link
        casper.click('a.btn#typicalCase');
        casper.wait(5000, function() {
        });
    });

    casper.then(function() {
        test.assertTitle('Sentia - Enlightenment for your Environment',' Sentia - Enlightenment for your Environment is the one expected');
        test.assert(this.exists('svg'), 'checking if svg exists');
    });

    casper.run(function() {
        test.done();
    });
});
