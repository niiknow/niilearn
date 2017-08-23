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
const illegalChars = /[^a-zA-Z0-9-_]/gi;

const handleBayesPost = (req, res, dataset, labels) => {
  const modelName = req.params.model.replace(illegalChars, '');
  const dataFile = `${dataPath}/bayes_${modelName}`;
  if (dataset.length <= 0 || dataset.length !== labels.length) {
    return res.send({
      message: 'data is empty or length does not match labels length.'
    });
  }

  const doTraining = classifier => {
    bayesModels.set(modelName, classifier, () => {});

    dataset.forEach((v, i) => {
      // normalize multiple space into one
      classifier.learn(v.toLowerCase(), labels[i]);
    });

    fs.writeFile(dataFile, classifier.toJson(), err => {
      if (err) {
        throw err;
      }

      // send a response message back on last iteration!
      res.send({
        message: `${dataset.length} samples added to database.`
      });
    });
  };

  bayesModels.get(modelName, (err, result) => {
    let classifier = bayes();
    if (!err && result) {
      return doTraining(result);
    }

    // expect both dataset and labels to be array of strings
    fs.readFile(dataFile, (err, data) => {
      if (!err && data) {
        classifier = classifier.fromJson(data.toString());
      }
      doTraining(classifier || bayes());
    });
  });
};

router.post('/bayes/reset/:model', (req, res) => {
  const modelName = req.params.model.replace(illegalChars, '');
  bayesModels.set(modelName, bayes(), () => {});
  const dataFile = `${dataPath}/bayes_${modelName}`;
  fs.unlink(dataFile, () => {
    res.send({
      message: `${modelName} reset done.`
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

const doClassify = (req, res) => {
  const modelName = req.params.model.replace(illegalChars, '');
  const body = req.body;
  const dataFile = `${dataPath}/bayes_${modelName}`;

  bayesModels.get(modelName, (err, result) => {
    let classifier = bayes();
    if (!err) {
      classifier = result || bayes();
    }

    fs.readFile(dataFile, (err, data) => {
      if (!err && data) {
        // console.log(data.toString());
        classifier = bayes.fromJson(data.toString());
        bayesModels.set(modelName, classifier, () => {});
      }

      const dataset = body.dataset || [req.query.text];
      const rst = [];
      dataset.forEach(v => {
        rst.push(classifier.categorize((v || '').toLowerCase()));
      });
      return res.send({
        result: rst
      });
    });
  });
};

router.post('/bayes/classify/:model', doClassify);
router.get('/bayes/classify/:model', doClassify);

module.exports = router;
