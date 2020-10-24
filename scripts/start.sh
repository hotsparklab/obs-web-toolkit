    echo "Mounting USB drive..."
    cd /usr/src/app/scripts
    /bin/bash mount.sh

    echo "Starting OBS Web Toolkit server..."
    cd /usr/src/app
    /usr/local/bin/yarn run serve
