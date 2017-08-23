const fs = require('fs');
const csv = require('csvtojson');
const express = require('express');
const bayes = require('bayes');

const router = express();
const dataPath = process.env.NIILEARN_DATAPATH || '/app/data';
const bayesModels = {};

const handleBayesPost = (req, res, dataset, labels) => {
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  const classifier = bayesModels[req.params.model] || bayes();

  if (dataset.length <= 0 || dataset.length !== labels.length) {
    return res.send({
      message: 'data is empty or length does not match labels length.'
    });
  }

  // expect both dataset and labels to be array of strings
  fs.readFile(dataFile, (err, data) => {
    if (!err && data && data.length > 20) {
      classifier.fromJson(data);
    }

    bayesModels[req.params.model] = classifier;
    dataset.forEach((v, i) => {
      // normalize multiple space into one
      classifier.learn(v.replace(/\s+/gi, ' '), labels[i]);
    });
    data = classifier.toJson;
    fs.writeFile(dataFile, JSON.stringify(data, null, 2), err => {
      if (err) {
        throw err;
      }

      // send a response message back on last iteration!
      res.send({
        message: 'Input added to database, classifier updated. Thank you.'
      });
    });
  });
};

router.post('/bayes/reset/:model', (req, res) => {
  bayesModels[req.params.model] = bayes();
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  fs.unlink(dataFile, () => {
    res.send({
      message: `${req.params.model} reset done.`
    });
  });
});

router.post('/bayes/train-csv/:labelField/:textField/:model', (req, res) => {
  // parse csv body
  const body = (req.rawBody || '').toString('utf8');
  const labelField = req.params.labelField;
  const textField = req.params.textField;
  const dataset = [];
  const labels = [];
  const csvopts = {
    noheader: false
  };

  csv(csvopts)
    .fromString(body)
    .on('json', jsonObj => {
      if (jsonObj[textField]) {
        dataset.push(jsonObj[textField]);
        labels.push(jsonObj[labelField]);
      }
    }).on('done', () => {
      handleBayesPost(req, res, dataset, labels);
    });
});

router.post('/bayes/train/:model', (req, res) => {
  handleBayesPost(req, res, req.body.dataset, req.body.labels);
});

router.post('/bayes/classify/:model', (req, res) => {
  const body = req.body;
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  let classifier = bayesModels[req.params.model];
  if (!classifier) {
    classifier = bayes();
  }
  fs.readFile(dataFile, (err, data) => {
    if (!err && data && data.length > 20) {
      classifier = bayes.fromJson(data);
      bayesModels[req.params.model] = classifier;
    }
    const rst = classifier.categorize(body.Search.replace(/\s+/gi, ' '));
    res.send({
      data: body,
      result: rst
    });
  });
});

module.exports = router;
