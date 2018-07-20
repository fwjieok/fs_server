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

if [ ! -f "$JSYS/etc/config.json" ]; then
    cp $APP_HOME/etc/config.default.json $JSYS/etc/config.json
fi

cd $APP_HOME/lib
if [ -f "fs-main.js" ]; then
    while true ; do
        echo "====$(date)========  start $APP_NAME  =============="
        node fs-main.js &
        pid=$!
        wait $!
        sleep 1
    done

else
    echo -e "\033[43;35m not found fs-main.js\033[0m \n" 

fi
