module.exports = {
  
  instances: function(params, callback) {
    
    // Example filtering via params:
    
    // params.filter = {id: 'inst_id_3'} 
    // params.filter = {tags.Domain: 'ext'}
    
    // return array of objects, currently only `id` and `name` are required properties
    var instances = [
      {
        id: 'inst_id_1',
        name: 'foo',
        privateIp: '10.10.10.10',
        // ...
        tags: {}
      },
      {
        id: 'inst_id_2',
        name: 'bar',
        privateIp: '10.10.10.20',
        // ...
        tags: {}
      }
    ];
    
    // Detect errors from data source and forward on
    //if (err) return callback(err);
    callback(null, instances)
  },
    availabilityzones: function(params, callback) {
        var availabilityZones = [
            {
                id: 'zone_1',
                name: 'us-west-1a'
            },
            {
                id: 'zone_2',
                name: 'us-west-1b'
            }
        ];

        callback(null, availabilityZones);
    },

    vpcs: function(){
        var vpcs = [
            {
             id: 'vpc_1',
                name: 'extranet_vpc'
            },
            {
                id: 'vpc_2',
                name: 'intranet_vpc'
            }
        ];

        callback(null, vpcs);
    },

    subnets: function(){
        var subnets = [{
                id: 'subnet_1',
                name: 'extranet_subnet_dbs'
            },
            {
                id: 'subnet_2',
                name: 'intranet_subnet_web'
            }];

        callback(null, subnets);
    }
  
};
