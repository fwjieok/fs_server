#!/bin/bash -x
logger "[box] Installing none conwin dependencies ..."

function install_node() {
    folder=$JTMP/download/deps
    [ -d "$folder" ] && rm -rf $folder
    [ ! -d "$folder" ] && mkdir -p $folder
    cd $folder
    file="box2-node.tgz"
    wget "http://cos.conwin.cn/download/box2/$file"
    tar -xf $file
    target=/usr/bin/node
    [ -f "$target" ] && rm $target
    mv box2-node-v4.2.2-linux-x64 $target
}

function install_node_modules() {
    if [ -d "$JROOT/node_modules" ]; then
        return
    fi

    folder=$JTMP/download/deps
    [ -d "$folder" ] && rm -rf $folder
    [ ! -d "$folder" ] && mkdir -p $folder
    cd $folder
    file="cn8040-node-modules.tgz"
    wget "http://cos.conwin.cn/download/pub/$file"
    tar -xf $file
    [ -d "$JROOT/node_modules" ] && rm -rf $JROOT/node_modules
    mv ./node_modules $JROOT
}

## install node

need_install=true

[ ! "$(which node)" = "" ] && [ "$(node -v)" = "v4.2.2" ]  && need_install=false

if [ "$need_install" = "true" ]; then
    install_node
fi

install_node_modules

