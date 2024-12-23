#!/bin/bash

# Print pending images
echo "printing... $(date)"
/usr/local/bin/yarn --cwd ./family-printer/printer/ print >> /var/log/printer_print.log 2>&1
echo "done $(date)"
