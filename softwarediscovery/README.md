
# Software Discovery

**Description**:  We live in a world were DevOps and Developers create servers and over time install software
without documenting.  This can lead to security vulnerablities and make sys admins jobs a living nightmare.  Using the
included python scripts, anyone (with proper credentials) can automatically list out installed software and all python modules
(no matter what virtualenv it was installed under) on a linux machine. This info is saved to elasticsearch.

  - **Technology stack**:  This is pure Python and ElasticSearch 1.4.x
  - **Status**:  This is in the Beta Stage


## Dependencies

This requires Python 2.6+ and Fabric libraries. This has been tested with ElasticSearch 1.4.2 but could be modified
(in theory ) with a web api, mongodb, etc.



## Usage

There are two ways to use this software.

1. With Fabric
```
fab -H <host machine ip> -u <user name>  -f fab_push.py  task:elasticurl=<ip address & port of elasticsearch>

```

2. Without Fabric
Put get_installed_software.py on the machine you want to collect the information from. The run
```
python get_installed_software.py <ip address & port of elasticsearch>
```


*note not include elasticurl argument will just print out the software information in json format