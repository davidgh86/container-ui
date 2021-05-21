#!/bin/bash
sudo systemctl stop gestion_contenedores
sudo systemctl start gestion_contenedores
sudo systemctl daemon-reload gestion_contenedores
sudo nano /lib/systemd/system/gestion_contenedores.service
logs PATH /home/david/container-ui/public/logs