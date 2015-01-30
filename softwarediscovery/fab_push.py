from fabric.api import run
from fabric.operations import put


def task(elasticurl=None):
    put('./get_installed_software.py','/tmp/get_installed_software.py')
    if elasticurl != None:
        run("python /tmp/get_installed_software.py " + elasticurl)
    else:
        run("python /tmp/get_installed_software.py "  )

    run("rm /tmp/get_installed_software.py")