#!/bin/bash

# Print pending images
echo "printing... $(date)"
/usr/local/bin/yarn --cwd ./family-printer/printer/ update >> /var/log/printer_update.log 2>&1
echo "done $(date)"
