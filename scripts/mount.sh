# Automatically mount a USB drive by specified volume name.
# Note: make sure to have USB_VOLUME_NAME set in env vars.
# Thanks: https://github.com/balena-io-playground/balena-storage

if [[ -z "$USB_VOLUME_NAME" ]]; then
  echo "Make sure to set environment variable USB_VOLUME_NAME in order to find a connected USB drive by that label and connect to it. Exiting..." >> /usr/src/app/mount.log
  exit 1
fi

# Get device by label env var set in balena.io dashboard device env vars
USB_DEVICE=$(blkid -L "$USB_VOLUME_NAME")
if [[ -z "$USB_DEVICE" ]]; then
  echo "Invalid USB_DEVICE name: $USB_DEVICE"
  exit 1
fi

MOUNT_POINT=/mnt/"$USB_VOLUME_NAME"

# Mount device
if /bin/findmnt -rno SOURCE,TARGET "$USB_DEVICE" >/dev/null; then
    echo "Device $USB_DEVICE is already mounted!"
else
    echo "Mounting - Source: $USB_DEVICE - Destination: $MOUNT_POINT"
    /bin/mkdir -p "$MOUNT_POINT"
    /bin/mount -t auto -o rw "$USB_DEVICE" "$MOUNT_POINT"
fi
