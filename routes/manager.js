var express = require('express');
const { exec } = require("child_process");
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
var router = express.Router();

const constants = require('./containerList')

function getContainerName(owner) {
  let container = findContainerByOwner(owner)
  let containerName = container.container
  return containerName;
}

function getContainerDescription(owner) {
  let container = findContainerByOwner(owner)
  let containerDescription = container.description
  return containerDescription;
}

/* Shows status */
router.post('', function(req, res, next) {
  let owner = req.body.owner;
  getStatusAndRedirect(owner, res);
});

/* stop and show status */
router.post('/stop', function(req, res, next) {
  let owner = req.body.owner;
  let containerName = getContainerName(owner)
  let command = `docker stop ${containerName}`;
  executeCommand(command, owner, res, getStatusAndRedirect);
});

/* start and show status */
router.post('/start', function(req, res, next) {
  let owner = req.body.owner;
  let containerName = getContainerName(owner)
  let command = `docker start ${containerName}`;
  executeCommand(command, owner, res, getStatusAndRedirect);
});

/* restart and show status */
router.post('/restart', function(req, res, next) {
  let owner = req.body.owner;
  let containerName = getContainerName(owner)
  let command = `docker restart ${containerName}`;
  executeCommand(command, owner, res, getStatusAndRedirect);
});

/* restart and show status */
router.post('/logs', function(req, res, next) {
  let owner = req.body.owner;
  let containerName = getContainerName(owner)
  let uuid = uuidv4()
  let command = `docker logs ${containerName} 2>&1 | cat > ${process.env.LOG_PATH}/${owner}_${uuid}.log`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      res.render('../views/error', { error });
    } else if (stderr) {
      console.log(`stderr: ${stderr}`);
      res.render('../views/error', {
        error: {
          message: stderr
        }
      });
    } else {
      let containerDescription = getContainerDescription(owner)
      res.render('../views/logs', {containerDescription: containerDescription, logFile: `${owner}_${uuid}.log`})
    }
  });
});

function findContainerByOwner(owner) {
  return constants.CONTAINERS.find(function (item) {
    return item.key === owner;
  });
}

function executeCommand(command, owner, res, callback) {
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      res.render('../views/error', { error });
    } else if (stderr) {
      console.log(`stderr: ${stderr}`);
      res.render('../views/error', {
        error: {
          message: stderr
        }
      });
    } else {
      callback(owner, res);
    }
  });
}

function getStatusAndRedirect(owner, res) {
  let containerName = getContainerName(owner);
  let command = `docker ps --filter \"name=^/${containerName}$\" --format \"{{.Status}}\"`;

  exec(command, (error, stdout, stderr) => {
    let status = "Status: ";
    if (error) {
      console.log(`error: ${error.message}`);
      res.render('../views/error', { error });
    } else if (stderr) {
      console.log(`stderr: ${stderr}`);
      res.render('../views/error', {
        error: {
          message: stderr
        }
      });
    } else { 
      if (!stdout) {
        status += "Caido";
      } else {
        status += stdout;
      }
      let containerDescription = getContainerDescription(owner)
      res.render('../views/status',
        {
          status: status,
          owner: owner,
          containerDescription: containerDescription
        });
      }
  });
}

module.exports = router;
