const fs = require('fs');
const csv = require('csvtojson');
const express = require('express');
const bayes = require('bayes');
const cacheManager = require('cache-manager');

const router = express();
const dataPath = process.env.NIILEARN_DATAPATH || '/app/data';
const bayesModels = cacheManager.caching({
  store: 'memory',
  max: 100,
  ttl: 120 /* seconds */
});

const handleBayesPost = (req, res, dataset, labels) => {
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  if (dataset.length <= 0 || dataset.length !== labels.length) {
    return res.send({
      message: 'data is empty or length does not match labels length.'
    });
  }

  bayesModels.get(req.params.model, (err, result) => {
    let classifier = bayes();
    if (!err) {
      classifier = result || bayes();
    }

    // expect both dataset and labels to be array of strings
    fs.readFile(dataFile, (err, data) => {
      if (!err && data) {
        classifier = classifier.fromJson(data.toString());
      }

      bayesModels.set(req.params.model, classifier, () => {});

      dataset.forEach((v, i) => {
        // normalize multiple space into one
        classifier.learn(v.replace(/\s+/gi, ' '), labels[i]);
      });
      data = classifier.toJson();
      fs.writeFile(dataFile, data, err => {
        if (err) {
          throw err;
        }

        // send a response message back on last iteration!
        res.send({
          message: `${dataset.length} samples added to database.`
        });
      });
    });
  });
};

router.post('/bayes/reset/:model', (req, res) => {
  bayesModels.set(req.params.model, bayes(), () => {});
  const dataFile = `${dataPath}/bayes_${req.params.model}`;
  fs.unlink(dataFile, () => {
    res.send({
      message: `${req.params.model} reset done.`
    });
  });
});

router.post('/bayes/train-csv/:model', (req, res) => {
  // parse csv body
  const body = (req.rawBody || '').toString('utf8');
  const textField = req.query.text || 'text';
  const labelField = req.query.label || 'label';
  const dataset = [];
  const labels = [];
  const csvopts = {
    noheader: false
  };
  console.log(req.query);

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

  bayesModels.get(req.params.model, (err, result) => {
    let classifier = bayes();
    if (!err) {
      classifier = result || bayes();
    }
    fs.readFile(dataFile, (err, data) => {
      if (!err && data) {
        // console.log(data.toString());
        classifier = bayes.fromJson(data.toString());
        bayesModels.set(req.params.model, classifier, () => {});
      }

      const dataset = body.dataset || [];
      const rst = [];
      dataset.forEach(v => {
        rst.push(classifier.categorize((v || '').replace(/\s+/gi, ' ')));
      });
      return res.send({
        result: rst
      });
    });
  });
});

module.exports = router;
