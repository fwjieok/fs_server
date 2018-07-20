#!/bin/bash -x
echo "install GATEWAY..."
echo "install PANEL..."

[ -d "$JAPPS/gateway" ] && rm -rf $JAPPS/gateway
[ -d "$JAPPS/panel" ] && rm -rf $JAPPS/panel

mv apps/gateway $JAPPS
mv apps/panel $JAPPS
