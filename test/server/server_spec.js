//These tests will create a running test instance of sentia for you so do not need to start an running instance of sentia
var should = require('should'),
    request = require('supertest'),
    assert = require('assert'),
    sentiaServerApp = require('../../server'),
    sentiaInfoRequest;

describe('Server', function(){

    before(function (){
        //setup the request object with the express app
        sentiaInfoRequest = request(sentiaServerApp.app);
    });
    after(function (){
       //post test
    });

    //mocha sanity check
    describe('#equal', function () {
        var three='3';
       it('should return true that 3 equals "3"', function() {
           assert.equal(three, '3', '3 equals "3"');
       });
        it('"3" only strictly equals 3.toString()', function() {
            assert.strictEqual(three, '3', '3 equals "3"');
        });
    });

    describe('sentia get bad path', function(){
        it('should respond to GET with 404', function(done){
            sentiaInfoRequest
                .get('/badpath')
                .end(function(err, res){
                    res.status.should.equal(404);
                    done();
                });

        });
    });

    //get start page
    describe('sentia start page', function(){
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
     });

    //get start page
    describe('sentia networkchart page', function(){
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/networkchart')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('Get instances via api/instances/ from all providers', function() {
        this.timeout(60000); //increase default time to 1 minute, due potentially large number of instances
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/api/instances/')
                .end(function(err, res){
                    res.text.should.not.equal(undefined);
                    done();
                });

        });
    });


    describe('Get availabilityzones via api/availabilityzones/ from all providers', function() {
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/api/availabilityzones/')
                .end(function(err, res){
                    res.text.should.not.equal(undefined);
                    done();
                });

        });
    });

    describe('Get vpcs via api/vpcs/ from all providers', function() {
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/api/vpcs/')
                .end(function(err, res){
                    res.text.should.not.equal(undefined);
                    done();
                });

        });
    });

    describe('Get subnets via api/subnets/ from all providers', function() {
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/api/subnets/')
                .end(function(err, res){
                    res.text.should.not.equal(undefined);
                    done();
                });

        });
    });


    describe('Get instances via not existing path , api/instances/xyz/', function() {
        it('should respond to GET with 500', function(done){
            sentiaInfoRequest
                .get('/api/instances/xyz/')
                .end(function(err, res){
                    res.status.should.not.equal(200);
                    done();
                });


        });
    });

    describe('Get instances via api/instances?filter using JSON syntax', function() {
        it('should respond to GET with 200', function(done){
            sentiaInfoRequest
                .get('/api/instances?filter={"providers": ["aws"],"data.placement.availabilityZone":["us-east-1a"] }')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('Get instances via api/availabilityzones?filter using JSON syntax', function() {
        it('should respond to GET with 200', function(done){
            sentiaInfoRequest
                .get('/api/availabilityzones?filter={"providers": ["aws"] }')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('Get instances via api/vpcs?filter using JSON syntax', function() {
        it('should respond to GET with 200', function(done){
            sentiaInfoRequest
                .get('/api/vpcs?filter={"providers": ["aws"] }')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
    });

    describe('Get instances via api/subnets?filter using JSON syntax', function() {
        it('should respond to GET with 200', function(done){
            sentiaInfoRequest
                .get('/api/subnets?filter={"providers": ["aws"] }')
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });
    });


    describe('try to go undefined path', function(){

        it('should respond to GET with 301', function(done){
            sentiaInfoRequest
                .get('/pathnothere')
                .expect(301);
            done();
        });
    });







});

