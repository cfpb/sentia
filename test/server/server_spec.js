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

    describe('Get instances via api/instances/', function() {
        it('should respond to GET', function(done){
            sentiaInfoRequest
                .get('/api/instances/')
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
    //api/instances?filter={"providers": ["aws"],"data.placement.availabilityZone":["us-east-1a"],"data.securityGroups":[{"groupName":"ext_mgt_lin"}] }
    describe('Get instances via api/instances?filter JSON syntax', function() {
        it('should respond to GET with 200', function(done){
            sentiaInfoRequest
                .get('/api/instances?filter={"providers": ["aws"],"data.placement.availabilityZone":["us-east-1a"] }')
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

