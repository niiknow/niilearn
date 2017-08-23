const fs = require('fs');
const csv = require('csvtojson');
const express = require('express');
const {
  Bayes
} = require('nodeml');

const router = express();
const dataPath = process.env.NIILEARN_DATAPATH || '/app/data';
const bayesModels = {};

const handleBayesPost = (req, res, dataset, labels) => {
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  const bayes = bayesModels[req.params.model] || new Bayes();

  if (dataset.length <= 0 || dataset.length !== labels.length) {
    return res.send('data is empty or length does not match labels length.');
  }

  fs.readFile(dataFile, (err, data) => {
    if (!err && data && data.length > 20) {
      bayes.setModel(JSON.parse(data));
    }

    bayes.train(dataset, labels);
    data = bayes.getModel();
    fs.writeFile(dataFile, JSON.stringify(data, null, 2), err => {
      if (err) {
        throw err;
      }

      // send a response message back on last iteration!
      res.send('Input added to database, classifier updated. Thank you.');
    });
  });
};

router.post('/bayes/train-csv/:label/:model', (req, res) => {
  // parse csv body
  const body = req.rawBody.toString('utf8');
  const label = req.params.label;
  const dataset = [];
  const labels = [];
  const csvopts = {
    noheader: false
  };

  csv(csvopts)
    .fromString(body)
    .on('json', jsonObj => {
      const cat = jsonObj[label];
      labels.push(cat);
      delete jsonObj.CircularItemId;
      delete jsonObj[label];
      dataset.push(jsonObj);
      console.log(cat, JSON.stringify(jsonObj));
    }).on('done', () => {
      // console.log(dataset);
      // console.log(labels);
      handleBayesPost(req, res, dataset, labels);
    });
});

router.post('/bayes/train/:model', (req, res) => {
  handleBayesPost(req, res, req.body.dataset, req.body.labels);
});

router.post('/bayes/classify/:model', (req, res) => {
  const body = req.body;
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  let bayes = bayesModels[req.params.model];
  if (!bayes) {
    bayes = new Bayes();
  }
  fs.readFile(dataFile, (err, data) => {
    if (!err && data && data.length > 20) {
      bayes.setModel(JSON.parse(data));
      bayesModels[req.params.model] = bayes;
    }
    const rst = bayes.test(body);
    console.log(body);
    res.send(rst);
  });
});

module.exports = router;
