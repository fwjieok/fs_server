#!/bin/sh
pid=
function clean_up () {
    [ ! "$pid" = "" ] && kill $pid
    exit
}
trap "clean_up" SIGTERM SIGINT

echo "conwin init of fs-server"

echo "APP_NAME = $APP_NAME"
echo "APP_HOME = $APP_HOME"

cd $APP_HOME/lib
if [ -f "fs-main.js" ]; then
    while true ; do
        echo "====$(date "")========  start $APP_NAME  =============="
        node fs-main.js &
        pid=$!
        wait $!
        sleep 1
    done

else
    echo -e "\033[43;35m not found fs-main.js\033[0m \n" 

fi
