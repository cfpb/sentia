import sys
from subprocess import Popen, PIPE
import operator
import json
from time import gmtime, strftime
import hashlib




def is_json(test_json):
  try:
    json_object = json.loads(test_json)
  except ValueError, e:
    print str(e)
    return False
  return True

def get_pip_packages():

    try:

        import pip
        print("Getting Packages...")
        installed_packages = pip.get_installed_distributions()
        installed_packages_list = sorted(["%s==%s" % (i.key, i.version)
                                           for i in installed_packages])

        return ' "pythonlist" : ' + json.dumps(installed_packages_list)
    except:
        print ("Issue with PIP")
        return ' "pythonlist" : []  '

try:
    elasticsearch_url = sys.argv[1]
except:
    elasticsearch_url = None


#create json template that will be passed to elasticsearch
master_json = '{'\
              '  "host_name" : "$host_name",  ' \
              '  "ip_address" : "$ip_address",  ' \
              '  "date_created": "$date",  ' \
              '  "iptables" : $iptables , ' \
              '  "python_libraries" :  {$python_libraries }, ' \
              '  "processes" : $processes , ' \
              '  "yum_installed" : $yum ' \
              '}'

master_json = str(master_json)

#add gmt time
master_json = master_json.replace("$date", strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime()) )






#get host name
p = Popen("hostname ", shell=True, stdout=PIPE)
host_name = p.stdout.read().splitlines()[0]
print host_name
master_json = master_json.replace("$host_name",host_name )

#get the machine ip address
p = Popen("/sbin/ifconfig eth0 | awk '/inet/ { print $2 } ' | sed -e s/addr://", shell=True, stdout=PIPE)
ip_address = p.stdout.read().splitlines()[0]
master_json = master_json.replace("$ip_address",ip_address )


#create a unique id for this json
_id = strftime("%a%b%Y%H:%M:%S", gmtime()) + host_name
_id = hashlib.sha224(_id).hexdigest()


python_installed = get_pip_packages()


#call each virtualenv and figure out what python libaries are installed
p = Popen("source $(which virtualenvwrapper.sh) && lsvirtualenv -b  ", shell=True, stdout=PIPE)

_list = p.stdout.read().splitlines()

json_pattern = '"$virtualenvName" : $list '

virtualenvs_json_list = []


for v in _list:
    #print( "Virtualenv: " + v)
    cmd = "source $(which virtualenvwrapper.sh) ; workon " + v + " ; lssitepackages"
    p = Popen(cmd, shell=True, stdout=PIPE)
    temp_list  = p.stdout.read().splitlines()
    json_list = json.dumps(temp_list)
    json_temp =  json_pattern.replace("$virtualenvName",v)
    json_temp =  json_temp.replace("$list",json_list)
    virtualenvs_json_list.append(json_temp)

if len(virtualenvs_json_list) > 0 :
    master_json = master_json.replace("$python_libraries", python_installed + "," +  ",".join(virtualenvs_json_list) )
else:
    master_json = master_json.replace("$python_libraries", python_installed  )

#view all the processes that are currently running
cmd = "ps -e -o comm --sort=-comm"
p = Popen(cmd, shell=True, stdout=PIPE)

dict_proc = {}

#do this to remove duplicates
for i in p.stdout.read().splitlines():
    dict_proc[i] = i

sorted_dict_proc = sorted(dict_proc.items(), key=operator.itemgetter(0))

json_temp = json.dumps([item[0] for item in sorted_dict_proc])

master_json = master_json.replace("$processes", json_temp)


# Call yum and scrub out all that crazy amount of white space.
p = Popen("sudo yum list installed", shell=True, stdout=PIPE)

temp_yum = p.stdout.read().splitlines()

json_temp = json.dumps(temp_yum)
json_temp = json_temp.replace("               ","  ")
json_temp = json_temp.replace("            ","  ")
json_temp = json_temp.replace("         ","  ")
json_temp = json_temp.replace("        ","  ")
json_temp = json_temp.replace("      ","  ")
json_temp = json_temp.replace("     ","  ")

master_json = master_json.replace("$yum", json_temp )




#get iptables
p = Popen("sudo iptables -L -v -n", shell=True, stdout=PIPE)

temp_iptables = p.stdout.read().splitlines()
json_temp = json.dumps(temp_iptables)

json_temp = json_temp.replace("'","")


master_json = master_json.replace("$iptables", json_temp )




print "valide json:" + str(is_json(master_json))


#post to elasticsearch

if elasticsearch_url != None:
    run_curl = "curl -XPUT %s/installedsoftware/%s/%s -d " % (elasticsearch_url,host_name , _id)
    print run_curl
    json = "' %s '" % master_json

    p = Popen(run_curl + json  , shell=True, stdout=PIPE)
    print p.stdout.read()
else:
    print master_json














