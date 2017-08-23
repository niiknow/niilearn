# niilearn
Machine Learning REST API in nodejs.  

* This API implement naivebayes algorithm to classify your data.  It is useful to automatically identify category of various data types.  Examples:

    - Product/Item Category
    - Language
    - Gender
    - etc....

* This API also allow for continous training of your data. The more you train of your model with good data, the better the quality of the result.

* A completely independent microservice (with docker) for running Saas style Machine Learning API like Monkey Learn.  You can also mount docker volume '/app/data' for data persistence.

# API

## POST /api/v1/bayes/train/:modelName
post a JSON with array of dataset and labels

```
{
    "dataset": ["string1", "string2" ... "stringn"],
    "labels": [cat1, cat2, ... catn]
}
```

## POST /api/v1/bayes/train-csv/:modelName?label=fieldName&text=fieldName
post as CSV

* CSV must have a header
* header is either text/label or defined in query string

## POST /api/v1/bayes/reset/:modelName
clear the data - start your training over

## POST /api/v1/bayes/classify/:modelName
pass in 'dataset' array to bulk classify or a single item to classify only one.  Results are mapped to input 'dataset' array index.

```
{
    "dataset": ["sometext1", "sometext2"]
}

// returns
{
    result: ["cat1", "cat2"]
}
```

# TODO
- [] additional algorithm
- [] twitter sentiment example

# MIT
