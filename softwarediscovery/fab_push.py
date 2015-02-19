import urllib2
import json
import sys
from fabric.api import run
from fabric.operations import put
from fabric.context_managers import settings


#get all ipaddresses stored in edda and process them
def process_all(argv):

    elasticsearch_url = argv[1]
    edda_url = argv[2]
    machine_user = argv[3]

    if argv[4] != "key_filename:none":
      filename = argv[4].split(":")[1]
      print "Key_FileName: " + filename
    else:
      filename = None

    req = urllib2.urlopen(edda_url+'/edda/api/v2/view/instances/;_expand=1;~:(privateIpAddress)')

    ipaddresses = json.load(req)

    print "Found " + str(len(ipaddresses)) + " ipaddresses"

    count =0
    for machine_ip in ipaddresses:
        count += 1
        print str(count)+". SSH into machine_ip: " + machine_ip["privateIpAddress"]
        try:
            with settings(host_string=machine_ip["privateIpAddress"], user=machine_user, key_filename=filename):
                task(elasticurl=elasticsearch_url)
        except:
            print "Issue connecting"


def task(elasticurl=None):
    put('./get_installed_software.py','/tmp/get_installed_software.py')
    if elasticurl != None:
        run("python /tmp/get_installed_software.py " + elasticurl)
    else:
        run("python /tmp/get_installed_software.py "  )

    run("rm /tmp/get_installed_software.py")



if __name__ == "__main__":
    if len(sys.argv) == 5:
        process_all(sys.argv)
    else:
        print "Invalid Arguments"






