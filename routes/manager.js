var express = require('express');
const { exec } = require("child_process");
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');
var router = express.Router();

function getContainerName(owner) {
  let containerName
  if ("david"==owner){
    containerName = "contenedor_divergencias_david"
  }else if("alberto"==owner){
    containerName = "contenedor_divergencias_alberto"
  }
  return containerName;
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
  let command = `docker logs ${containerName} 2>&1 | cat > ${process.env.LOG_PATH}/${uuid}.txt`;
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
      fs.readFile(`${process.env.LOG_PATH}/${uuid}.txt`, 'utf8', (err, data) => {
        if (err) {
          res.render('../views/error', { error: err });
        } else {
          res.render('../views/logs', {owner: owner, log: data})
        }
      })
    }
  });
});

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
  let command = `docker ps --filter \"name=${containerName}\" --format \"{{.Status}}\"`;

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
      res.render('../views/status',
        {
          status: status,
          owner: owner
        });
      }
  });
}

module.exports = router;


