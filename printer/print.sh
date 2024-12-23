#!/bin/bash

# Print pending images
echo "printing... $(date)"
yarn --cwd /home/juliensanchez/family-printer/printer/ print
echo "done $(date)"
